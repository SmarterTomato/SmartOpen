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
            return;
        }
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
        if (!workspaceFolder) {
            return;
        }

        let name = path.basename(activeTextEditor.document.fileName);
        let relativePath = path.relative(workspaceFolder.uri.fsPath, activeTextEditor.document.fileName);
        let activeFile = new FileInfoItem(name, activeTextEditor.document.fileName, relativePath);

        let fileInfos = this.getAllFilesInCurrentWorkspace();
        let relatedFiles = this.getRelatedFiles(activeFile, fileInfos);

        relatedFiles = relatedFiles.sort(x => x.rule.order);
        this.showQuickPick(activeFile, relatedFiles);
    }

    /**
     * Shows quick open dialog and opens the file picked by user
     * @param activeFile
     * @param relatedFiles
     */
    private showQuickPick(activeFile: FileInfoItem, relatedFiles: Array<FileInfoItem>) {
        // let array = ["1", "12", "3", "4"];
        // vscode.window.showQuickPick(array);
        // let pick = vscode.window.createQuickPick();
        // pick.items = [{ label: "1" }, { label: "12" }, { label: "13" }, { label: "4" }];
        // pick.show();
        // setTimeout(() => {
        //     pick.items = [{label: "15"}, {label: "6"}, {label: "13"}, {label: "14"}];
        // }, 5000);


        let placeHolder = `Related files to ${activeFile.name}...`;

        if (relatedFiles.length === 0) {
            placeHolder = `No files found related to ${activeFile.name}...`;
        }

        vscode.window.showQuickPick(relatedFiles, { placeHolder: placeHolder}).then(selected => {
            if (selected) {
                vscode.workspace.openTextDocument(selected.fullPath).then(document => {
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
        let relatedFiles = new Array<FileInfoItem>();

        for (let file of files) {
            if (activeFile.fullPath !== file.fullPath) {
                if (this.matchFiles(activeFile, file, configService.getActivatedRules())) {
                    relatedFiles.push(file);
                }
            }
        }

        return relatedFiles;
    }

    private matchFiles(activeFile: FileInfoItem, file: FileInfoItem, rules: Array<Rule>): boolean {
        for (const rule of rules) {
            activeFile.rule = rule;
            ruleLogic.analysisFile(activeFile);
            // - If the current file not match to the rule, ignore
            if (!activeFile.isMatch) {
                continue;
            }

            file.rule = rule;
            ruleLogic.analysisFile(file);
            if (file.isMatch && ruleLogic.areFileInfosMatch(activeFile, file)) {
                return true;
            }
        }
    }

    /**
     * Get all file informations in current workspace as QuickPickItem
     */
    private getAllFilesInCurrentWorkspace(): Array<FileInfoItem> {
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
