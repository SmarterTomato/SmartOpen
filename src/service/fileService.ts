import * as vscode from "vscode";

import { configService } from "./configService";
import { ruleLogic } from "../logic/ruleLogic";
import { FileInfoItem, FileInfo, MatchResult } from "../model/fileInfo";

let fileSystem = require("fs");
let path = require("path");

class FileService {
    caching = false;
    onAnalysisComplete = new vscode.EventEmitter();

    openRelatedFile() {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            // Don't do anything if not text editor for now
            // List all files later if needed
            // This should not happen right now due to the shortcut binding
            vscode.window.showInformationMessage(`Open related file activated, but no active text editor`);
            console.log(`Open related file activated, but no active text editor`);
            return;
        }
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showInformationMessage(`Active text editor not belongs to workspace`);
            console.log(`Active text editor not belongs to workspace`);
            return;
        }

        console.debug(`Getting active file`);

        let name = path.basename(activeTextEditor.document.fileName);
        let relativePath = path.relative(workspaceFolder.uri.fsPath, activeTextEditor.document.fileName);
        let activeFile = new FileInfo(name, activeTextEditor.document.fileName, relativePath);
        console.debug(`Active file >>> ${JSON.stringify(activeFile)}`);

        let config = configService.get();
        let fileInfos = this.getAllFilesInCurrentWorkspace(config.fileFilters, config.ignoredFiles);

        let matchResults = this.getRelatedFiles(activeFile, fileInfos);

        console.debug(`Sorting`);
        matchResults = matchResults.sort((a, b) => {
            if (a.rule.order < b.rule.order) {
                return -1;
            } else if (a.rule.order === b.rule.order && a.rule.order > 100) {
                return a.fileInfo.name > b.fileInfo.name ? 1 : -1;
            } else if (a.rule.order === b.rule.order && a.fileInfo.name > b.fileInfo.name) {
                return -1;
            } else {
                return 1;
            }
        });

        let fileInfoItems = new Array<FileInfoItem>();
        for (let result of matchResults) {
            fileInfoItems.push(new FileInfoItem(result.fileInfo));
        }

        this.showQuickPick(activeFile, fileInfoItems);
    }

    // cacheWorkspace() {
    //     let workspaceFolders = vscode.workspace.workspaceFolders;

    //     if (!workspaceFolders || workspaceFolders.length === 0) {
    //         return;
    //     }

    //     let rules = configService.getActivatedRules();

    //     for (const folder of workspaceFolders) {
    //         let path = folder.uri.fsPath + "\\" + ".gitignore";
    //         let ignore = this.readIgnoreFile(path);

    //         this.getAllFiles(folder.uri.fsPath, folder.uri.fsPath, ignore);
    //     }
    // }

    populateFileInfo(fileNames: Array<string>) {}

    /**
     * Shows quick open dialog and opens the file picked by user
     * @param activeFile
     * @param relatedFiles
     */
    private showQuickPick(activeFile: FileInfo, relatedFiles: Array<FileInfoItem>) {
        console.debug(`Showing pick dialog for ${relatedFiles.length} files`);

        let placeHolder = `Related files to ${activeFile.name}...`;

        if (relatedFiles.length === 0) {
            placeHolder = `No files found related to ${activeFile.name}...`;
        }

        vscode.window.showQuickPick(relatedFiles, { placeHolder: placeHolder }).then(selected => {
            if (selected) {
                vscode.workspace.openTextDocument(selected.fileInfo.fullPath).then(document => {
                    console.debug(`Open document >>> ${selected.fileInfo.relativePath}`);
                    vscode.window.showTextDocument(document);
                });
            }
        });
    }

    /**
     * Calculate related files
     * @param activeFile
     * @param files
     */
    private getRelatedFiles(activeFile: FileInfo, files: Array<FileInfo>): Array<MatchResult> {
        console.debug(`Getting related files`);

        let relatedFiles = new Array<MatchResult>();
        let rules = configService.getActivatedRules().sort((a, b) => {
            if (a.order > b.order) {
                return 1;
            } else {
                return 0;
            }
        });

        let activeFileMatchResults = new Array<MatchResult>();

        for (let rule of rules) {
            let result = ruleLogic.analysisFile(activeFile, rule);
            // - If the current file not match to the rule, ignore
            if (result.isMatch) {
                activeFileMatchResults.push(result);
            }
        }

        for (let file of files) {
            for (let activeFileResult of activeFileMatchResults) {
                if (activeFile.fullPath !== file.fullPath) {
                    let result = ruleLogic.analysisFile(file, activeFileResult.rule);

                    if (result.isMatch && ruleLogic.areFileInfosMatch(activeFileResult, result)) {
                        relatedFiles.push(result);
                        console.debug(`Found match >>> ${JSON.stringify(file)}`);

                        break;
                    }
                }
            }
        }

        return relatedFiles;
    }

    /**
     * Get all file informations in current workspace as QuickPickItem
     */
    private getAllFilesInCurrentWorkspace(fileFilters: Array<string>, ignoredFiles: Array<string>): Array<FileInfo> {
        console.debug(`Get all files in workspace`);

        let results = new Array<FileInfo>();

        // Only scan file in current workspace
        let workspaceFolders = vscode.workspace.workspaceFolders;

        for (const folder of workspaceFolders) {
            let folderPath = folder.uri.fsPath;
            let filePaths = this.getAllFiles(folderPath, folderPath, fileFilters, ignoredFiles);

            for (const filePath of filePaths) {
                let name = path.basename(filePath);
                let relativePath = path.relative(folderPath, filePath);
                let fileInfo = new FileInfo(name, filePath, relativePath);
                results.push(fileInfo);
            }
        }

        console.debug(`Files count >>> ${results.length}`);
        return results;
    }

    private getAllFiles(
        basePath: string,
        dirPath: string,
        fileFilters: Array<string>,
        ignoreFileNames: Array<string>,
    ): Array<string> {
        let fileNames: Array<string> = new Array<string>();

        let names = fileSystem.readdirSync(dirPath);
        for (let name of names) {
            let fullPath = dirPath + "\\" + name;
            let relativePath = path.relative(basePath, fullPath);

            // * Only include file not be ignored
            let ignore = false;
            for (let item of ignoreFileNames) {
                try {
                    let reg = new RegExp("^" + item + "$");
                    if (reg.test(name) || reg.test(relativePath) || reg.test(fullPath)) {
                        ignore = true;
                        break;
                    }
                } catch (error) {
                    console.exception(`Ignored files regexp error >>> fileName=${item} | error=${error}`);
                }
            }

            if (ignore) {
                continue;
            }

            // - Path is a directory
            if (fileSystem.statSync(fullPath).isDirectory()) {
                let tmpFileNames = this.getAllFiles(basePath, fullPath, fileFilters, ignoreFileNames);
                fileNames = fileNames.concat(tmpFileNames);
            }
            // - Path is a file
            else {
                // * Only include file that match filter
                let include = false;
                for (let item of fileFilters) {
                    try {
                        let reg = new RegExp("^" + item + "$");
                        if (reg.test(name) || reg.test(relativePath) || reg.test(fullPath)) {
                            include = true;
                            break;
                        }
                    } catch (error) {
                        console.exception(`Include files regexp error >>> fileName=${item} | error=${error}`);
                    }
                }

                if (!include) {
                    continue;
                }

                fileNames.push(fullPath);
            }
        }

        return fileNames;
    }
}

let fileService = new FileService();
export { fileService };
