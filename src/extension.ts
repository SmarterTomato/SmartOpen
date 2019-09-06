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
    const syncActiveDocumentDisposable = vscode.commands.registerCommand("smartOpen.syncActiveDocument", () => {
        console.debug(`Sync active document started`);

        openRelatedFileService.syncActiveDocument();
    });
    context.subscriptions.push(syncActiveDocumentDisposable);

    // * Open related files
    const openRelatedFileDisposable = vscode.commands.registerCommand("smartOpen.openRelatedFile", (uri: Uri) => {
        console.debug(`Open related file started`);

        openRelatedFileService.openRelatedFile(uri);
    });
    context.subscriptions.push(openRelatedFileDisposable);

    // #endregion Open related files

    // #region Pinned documents

    // * Add view to explorer
    context.subscriptions.push(vscode.window.registerTreeDataProvider("pinnedDocument", pinnedDocumentProvider));

    // * Show quick pick pinned document
    const quickPickPinnedDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.quickPick",
        () => {
            console.debug(`Quick pick pinned documents started`);

            pinnedDocumentService.showQuickPick();
        },
    );
    context.subscriptions.push(quickPickPinnedDocumentDisposable);

    // * Pin document
    const pinDocumentDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.pin", (uri: Uri) => {
        console.debug(`Pin document started`);

        pinnedDocumentService.pinDocument(uri);
    });
    context.subscriptions.push(pinDocumentDisposable);

    // * Unpin document
    const unpinDocumentDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.unpin", (uri: Uri) => {
        console.debug(`Unpin document started`);

        pinnedDocumentService.unpinDocument(uri);
    });
    context.subscriptions.push(unpinDocumentDisposable);

    // * Open pinned document
    const openPinnedDocumentDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.open", uri => {
        console.debug(`Open pinned document started`);

        pinnedDocumentService.openDocument(uri);
    });
    context.subscriptions.push(openPinnedDocumentDisposable);

    // * Remove pinned document
    const removePinnedDocumentDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.remove",
        (treeItem: PinnedDocumentTreeItem) => {
            console.debug(`Remove pinned document started`);

            pinnedDocumentService.unpinDocument(treeItem.uri);
        },
    );
    context.subscriptions.push(removePinnedDocumentDisposable);

    // * Open all pinned documents
    const openAllPinnedDocumentsDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.openAll", () => {
        console.debug(`Open all pinned documents started`);

        pinnedDocumentService.openAll();
    });
    context.subscriptions.push(openAllPinnedDocumentsDisposable);

    // * Open all pinned documents
    const clearAllPinnedDocumentsDisposable = vscode.commands.registerCommand(
        "smartOpen.pinnedDocument.clearAll",
        () => {
            console.debug(`Clear all pinned documents started`);

            pinnedDocumentService.clearAll();
        },
    );
    context.subscriptions.push(clearAllPinnedDocumentsDisposable);

    // * Sort by name
    const sortByNameDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.sortByName", () => {
        console.debug(`Sort by name started`);

        pinnedDocumentService.sortBy(SortType.NAME);
    });
    context.subscriptions.push(sortByNameDisposable);

    // * Sort by type
    const sortByTypeDisposable = vscode.commands.registerCommand("smartOpen.pinnedDocument.sortByType", () => {
        console.debug(`Sort by type started`);

        pinnedDocumentService.sortBy(SortType.TYPE);
    });
    context.subscriptions.push(sortByTypeDisposable);

    // #endregion Pinned documents
}

// this method is called when your extension is deactivated
export function deactivate() {}
