import * as vscode from "vscode";

import { Rule } from "../model/rule";

class FileService {
    activatedTags: Array<string>;
    rules: Array<Rule>;
    fileSystem = require('fs');

    constructor() {
    }

    openRelatedFile() {
        // let filePath = this.getEditorFilePath();
        // if (!filePath || filePath === "") {
        //     return;
        // }

        // let fileNames = this.getAllFilesInCurrentWorkspace();
        // fileNames.forEach(name => {
        //     console.log(name);
        // });

        this.getSettings();
    }

    private getSettings() {
        this.activatedTags = vscode.workspace.getConfiguration().get("smartOpen.activatedTags");
        let defaultRule = vscode.workspace.getConfiguration().get("smartOpen.rules.defaultRule");
        // this.rules = this.rules.concat(defaultRule)
        let custom: Array<Rule> = vscode.workspace.getConfiguration().get("smartOpen.rules.custom");
        this.rules = this.rules.concat(custom);
    }

    private getEditorFilePath(): string {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return "";
        }

        let filePath = editor.document.fileName;
        console.log('Active editor file path: ' + filePath);

        return filePath;
    }

    private getAllFilesInCurrentWorkspace(): Array<string> {
        let fileNames: Array<string> = [];

        let workspaceFolders = vscode.workspace.workspaceFolders;

        workspaceFolders.forEach(folder => {
            let tmpFileNames = this.getAllFiles(folder.uri.fsPath);
            fileNames = fileNames.concat(tmpFileNames);
        });

        return fileNames;
    }

    private getAllFiles(dirPath: string): Array<string> {
        let fileNames: Array<string> = [];

        let names = this.fileSystem.readdirSync(dirPath);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            let path = dirPath + '\\' + name;
            // Path is a directory
            if (this.fileSystem.statSync(path).isDirectory()) {
                let tmpFileNames = this.getAllFiles(path);
                fileNames = fileNames.concat(tmpFileNames);
            }
            // Path is a file
            else {
                fileNames.push(path);
            }
        }

        return fileNames;
    }

    private getUserSettings() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return "";
        }
        let config = vscode.workspace.getConfiguration('', editor.document.uri);
    }

}

var fileService = new FileService();
export { fileService };
