import * as vscode from "vscode";

import { Rule } from "../model/rule";
import { configService } from "./configService";
import { ruleLogic } from "../logic/ruleLogic";
import { FileInfoItem } from "../model/fileInfo";

let fileSystem = require("fs");
let path = require("path");

class FileService {
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
        let activeFile = new FileInfoItem(name, activeTextEditor.document.fileName, relativePath);
        console.debug(`Active file >>> ${JSON.stringify(activeFile)}`);

        let fileInfos = this.getAllFilesInCurrentWorkspace();

        let relatedFiles = this.getRelatedFiles(activeFile, fileInfos);

        // ! Disabled due to performance issue
        console.debug(`Sorting`);
        relatedFiles = relatedFiles.sort(x => x.rule.order);

        this.showQuickPick(activeFile, relatedFiles);
    }

    /**
     * Shows quick open dialog and opens the file picked by user
     * @param activeFile
     * @param relatedFiles
     */
    private showQuickPick(activeFile: FileInfoItem, relatedFiles: Array<FileInfoItem>) {
        console.debug(`Showing pick dialog for ${relatedFiles.length} files`);

        let placeHolder = `Related files to ${activeFile.name}...`;

        if (relatedFiles.length === 0) {
            placeHolder = `No files found related to ${activeFile.name}...`;
        }

        vscode.window.showQuickPick(relatedFiles, { placeHolder: placeHolder }).then(selected => {
            if (selected) {
                vscode.workspace.openTextDocument(selected.fullPath).then(document => {
                    console.debug(`Open document >>> ${selected.relativePath}`);
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
    private getRelatedFiles(activeFile: FileInfoItem, files: Array<FileInfoItem>): Array<FileInfoItem> {
        console.debug(`Getting related files`);

        let relatedFiles = new Array<FileInfoItem>();

        let rules = configService.getActivatedRules();
        for (let file of files) {
            for (let rule of rules) {
                activeFile.reset();
                activeFile.setRule(rule);
                ruleLogic.analysisFile(activeFile);
                // - If the current file not match to the rule, ignore
                if (!activeFile.isMatch) {
                    continue;
                }

                if (activeFile.fullPath !== file.fullPath) {
                    file.reset();
                    file.setRule(rule);
                    ruleLogic.analysisFile(file);

                    if (file.isMatch && ruleLogic.areFileInfosMatch(activeFile, file)) {
                        relatedFiles.push(file);
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
    private getAllFilesInCurrentWorkspace(): Array<FileInfoItem> {
        console.debug(`Get all files in workspace`);

        let results = new Array<FileInfoItem>();

        // Only scan file in current workspace
        let workspaceFolders = vscode.workspace.workspaceFolders;

        for (const folder of workspaceFolders) {
            let folderPath = folder.uri.fsPath;
            let filePaths = this.getAllFiles(folderPath);

            for (const filePath of filePaths) {
                let name = path.basename(filePath);
                let relativePath = path.relative(folderPath, filePath);
                let fileInfo = new FileInfoItem(name, filePath, relativePath);
                results.push(fileInfo);
            }
        }

        console.debug(`Files count >>> ${results.length}`);
        return results;
    }

    private getAllFiles(dirPath: string): Array<string> {
        let fileNames: Array<string> = new Array<string>();

        let names = fileSystem.readdirSync(dirPath);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            let path = dirPath + "\\" + name;
            // - Path is a directory
            if (fileSystem.statSync(path).isDirectory()) {
                let tmpFileNames = this.getAllFiles(path);
                fileNames = fileNames.concat(tmpFileNames);
            }
            // - Path is a file
            else {
                fileNames.push(path);
            }
        }

        return fileNames;
    }
}

let fileService = new FileService();
export { fileService };
