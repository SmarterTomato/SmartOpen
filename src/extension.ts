// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Uri, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { openRelatedFileService } from "./openRelatedFile/openRelatedFileService";
import { pinnedDocumentProvider } from "./pinnedDocument/pinnedDocumentProvider";
import { pinnedDocumentService } from "./pinnedDocument/pinnedDocumentService";
import { PinnedDocumentTreeItem } from "./pinnedDocument/model/pinnedDocumentTreeItem";
import { SortType } from "./pinnedDocument/model/sortType";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log("Smart Open is now active!");

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // #region Open related files

    // * Open related files
    let openRelatedFileDisposable = vscode.commands.registerCommand("smartOpen.openRelatedFile.quickPick", () => {
        console.debug(`Open related file started`);

        openRelatedFileService.openRelatedFile();
    });
    context.subscriptions.push(openRelatedFileDisposable);

    // #endregion Open related files

    // #region Pinned documents

    // * Add view to explorer
    context.subscriptions.push(vscode.window.registerTreeDataProvider("pinnedDocument", pinnedDocumentProvider));

    // * Show quick pick pinned document
    let quickPickPinnedDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.quickPick",
        () => {
            console.debug(`Quick pick pinned documents started`);

            pinnedDocumentService.showQuickPick();
        },
    );
    context.subscriptions.push(quickPickPinnedDocumentDisposable);

    // * Pin document
    let pinDocumentDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.editor.pin", (uri: Uri) => {
        console.debug(`Pin document started`);

        pinnedDocumentService.pinDocument(uri);
    });
    context.subscriptions.push(pinDocumentDisposable);

    // * Unpin document
    let unpinDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.editor.unpin",
        (uri: Uri) => {
            console.debug(`Unpin document started`);

            pinnedDocumentService.unpinDocument(uri);
        },
    );
    context.subscriptions.push(unpinDocumentDisposable);

    // * Open pinned document
    let openPinnedDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.viewItem.open",
        uri => {
            console.debug(`Open pinned document started`);

            pinnedDocumentService.openDocument(uri);
        },
    );
    context.subscriptions.push(openPinnedDocumentDisposable);

    // * Remove pinned document
    let removePinnedDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.viewItem.remove",
        (treeItem: PinnedDocumentTreeItem) => {
            console.debug(`Remove pinned document started`);

            pinnedDocumentService.unpinDocument(treeItem.uri);
        },
    );
    context.subscriptions.push(removePinnedDocumentDisposable);

    // * Open all pinned documents
    let openAllPinnedDocumentsDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.view.openAll",
        () => {
            console.debug(`Open all pinned documents started`);

            pinnedDocumentService.openAll();
        },
    );
    context.subscriptions.push(openAllPinnedDocumentsDisposable);

    // * Open all pinned documents
    let clearAllPinnedDocumentsDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.view.clearAll",
        () => {
            console.debug(`Clear all pinned documents started`);

            pinnedDocumentService.clearAll();
        },
    );
    context.subscriptions.push(clearAllPinnedDocumentsDisposable);

    // * Sort by name
    let sortByNameDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.view.sortByName", () => {
        console.debug(`Sort by name started`);

        pinnedDocumentService.sortBy(SortType.NAME);
    });
    context.subscriptions.push(sortByNameDisposable);

    // * Sort by type
    let sortByTypeDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.view.sortByType", () => {
        console.debug(`Sort by type started`);

        pinnedDocumentService.sortBy(SortType.TYPE);
    });
    context.subscriptions.push(sortByTypeDisposable);

    // #endregion Pinned documents
}

// this method is called when your extension is deactivated
export function deactivate() {}
