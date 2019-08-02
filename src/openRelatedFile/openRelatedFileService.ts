import * as vscode from "vscode";

import { configService } from "../utils/configService";
import { openRelatedFileLogic } from "./openRelatedFileLogic";
import { FileInfoQuickPickItem, FileInfo, MatchResult } from "./model/fileInfo";

import * as fileSystem from "fs";
import * as path from "path";

class OpenRelatedFileService {
    caching = false;
    onAnalysisComplete = new vscode.EventEmitter();

    /**
     * Show quick pick for files that related to the active document
     */
    openRelatedFile() {
        // * Should only active when focus on text editor
        let activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            // This should not happen right now due to the shortcut binding
            // Don't do anything if not text editor for now
            // List all files later if needed
            vscode.window.showInformationMessage(`Open related file activated, but no active text editor`);
            console.log(`Open related file activated, but no active text editor`);
            return;
        }

        // * Show related file only available for workspace
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showInformationMessage(`Active text editor not belongs to workspace`);
            console.log(`Active text editor not belongs to workspace`);
            return;
        }

        // * Init info active documnet
        console.debug(`Getting active file`);
        let name = path.basename(activeTextEditor.document.fileName);
        let relativePath = path.relative(workspaceFolder.uri.fsPath, activeTextEditor.document.fileName);
        let activeFile = new FileInfo(name, activeTextEditor.document.fileName, relativePath);
        console.debug(`Active file >>> ${JSON.stringify(activeFile)}`);

        // Get configs for file filters
        let fileInfos = this.getAllFilesInCurrentWorkspace(
            configService.getFileFilters(),
            configService.getIgnoredFiles(),
        );

        // * Calculate related files
        let matchResults = this.getRelatedFiles(activeFile, fileInfos);

        // * Sort by rule order and file name
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

        this.showQuickPick(activeFile, matchResults);
    }

    /**
     * Shows quick open dialog and opens the file picked by user
     * @param activeFile - current active file info
     * @param results - match results
     */
    private showQuickPick(activeFile: FileInfo, results: Array<MatchResult>) {
        console.debug(`Showing pick dialog for ${results.length} files`);

        // * Convert to quick pick item
        let relatedFiles = new Array<FileInfoQuickPickItem>();
        for (let result of results) {
            relatedFiles.push(new FileInfoQuickPickItem(result.fileInfo));
        }

        let placeHolder = `Related files to ${activeFile.name}...`;
        if (relatedFiles.length === 0) {
            placeHolder = `No files found related to ${activeFile.name}...`;
        }

        vscode.window.showQuickPick(relatedFiles, { placeHolder: placeHolder }).then(selected => {
            // * Open selected document
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
     * @param activeFile - active file info
     * @param files - file infos in workspace
     * @returns - array of match result for related files
     */
    private getRelatedFiles(activeFile: FileInfo, files: Array<FileInfo>): Array<MatchResult> {
        console.debug(`Calculating related files`);

        // * Sort rules so the most important rule always match first
        let relatedFiles = new Array<MatchResult>();
        let rules = configService.getActivatedRules().sort((a, b) => {
            if (a.order > b.order) {
                return 1;
            } else {
                return 0;
            }
        });

        // * Match all rules with active file, only these rules needs to be calculated
        let activeFileMatchResults = new Array<MatchResult>();
        for (let rule of rules) {
            try {
                let result = openRelatedFileLogic.analysisFile(activeFile, rule);
                // - If the current file not match to the rule, ignore
                if (result.isMatch) {
                    activeFileMatchResults.push(result);
                }
            } catch (error) {
                // ! Rule not setup properly, some property missinng in the config
                vscode.window.showErrorMessage(
                    `Rule ${[rule]} is not a valid rule, please check the rule and try again. Or contact support`,
                );
                console.error(`Rule is not valid >>> rule=${[rule]} | activeFile=${activeFile.fullPath}`);
            }
        }

        for (let file of files) {
            for (let activeFileResult of activeFileMatchResults) {
                // * Match up the files in workspace to the rule that match active file
                if (activeFile.fullPath !== file.fullPath) {
                    let result = openRelatedFileLogic.analysisFile(file, activeFileResult.rule);

                    if (result.isMatch && openRelatedFileLogic.areFileInfosMatch(activeFileResult, result)) {
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
     * @param fileFilters - array of regex used to filter files
     * @param ignoredFiles - array of regex used to ignore file
     * @returns - array of file info
     */
    private getAllFilesInCurrentWorkspace(fileFilters: Array<string>, ignoredFiles: Array<string>): Array<FileInfo> {
        console.debug(`Get all files in workspace`);

        let results = new Array<FileInfo>();

        // Scan file in current workspace
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
                // - Only include file that match filter
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

let openRelatedFileService = new OpenRelatedFileService();
export { openRelatedFileService };
