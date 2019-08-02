import * as vscode from "vscode";
import { Uri } from "vscode";
import * as path from "path";

import { PinnedDocumentQuickPickItem } from "./model/pinnedDocumentQuickPickItem";
import { PinnedDocumentTreeItem } from "./model/pinnedDocumentTreeItem";
import { pinnedDocumentProvider } from "./pinnedDocumentProvider";
import { configService } from "./../utils/configService";
import { SortType } from "./model/sortType";

class PinnedDocumentService {
    pinnedDocuments: Array<PinnedDocumentTreeItem> = [];

    constructor() {
        this.load();
        this.refresh();
    }

    /**
     * Pin document to the view
     * @param uri - document uri. If uri not provided, pin active document instead
     */
    pinDocument(uri: Uri) {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (!uri && !activeTextEditor) {
            vscode.window.showInformationMessage(`Pin current document activated, but no active text editor`);
            console.log(`Pin current document activated, but no active text editor`);
            return;
        }

        // * If uri not provided, use active document instead
        if (!uri) {
            uri = activeTextEditor.document.uri;
        }

        console.debug(`Pin document start >>> ${uri}`);

        // * Check whether document pinned
        if (this.findPinnedDocumentItem(uri)) {
            vscode.window.showInformationMessage(`Document already in the pinned documents`);
            console.log(`Document already in the pinned documents`);
            return;
        }

        // Create view tree item
        let name = path.basename(uri.fsPath);
        let item = new PinnedDocumentTreeItem(
            uri,
            name,
            {
                title: "Open pinned document",
                command: "smartOpen.pinnedDocument.viewItem.open",
                arguments: [uri],
            },
            "smartOpen.pinnedDocument.viewItem.remove",
        );
        this.pinnedDocuments.push(item);

        this.sort();
        this.refresh();
        this.save();
    }

    /**
     * Unpinned document from the view
     * @param uri - document uri. If uri not provided, use active document instead
     */
    unpinDocument(uri: Uri) {
        let activeTextEditor = vscode.window.activeTextEditor;
        if (!uri && !activeTextEditor) {
            vscode.window.showInformationMessage(`Unpin current document activated, but no active text editor`);
            console.log(`Unpin current document activated, but no active text editor`);
            return;
        }

        // * If uri not provided, use active document instead
        if (!uri) {
            uri = activeTextEditor.document.uri;
        }

        console.debug(`Unpin document start >>> ${uri}`);

        // * Check whether document pinned
        if (!this.findPinnedDocumentItem(uri)) {
            vscode.window.showInformationMessage(`Current document not in the pinned documents`);
            console.log(`Current not in the pinned documents`);
            return;
        }

        this.removePinnedDocumentItem(uri);

        this.refresh();
        this.save();
    }

    /**
     * Show quick pick dialog for pinned documents
     */
    showQuickPick() {
        console.debug(`Showing quick pick for pinned documents`);

        let placeHolder = `Pinned document...`;
        if (this.pinnedDocuments.length === 0) {
            placeHolder = `No document pinned...`;
        }

        let items = this.pinnedDocuments.map(x => new PinnedDocumentQuickPickItem(x.uri));
        vscode.window.showQuickPick(items, { placeHolder: placeHolder }).then(selected => {
            // Open selected document
            if (selected) {
                this.openDocument(selected.uri);
            }
        });
    }

    /**
     * Open document window
     * @param uri - documnet uri
     */
    openDocument(uri: Uri) {
        if (!uri) {
            return;
        }

        console.debug(`Opening document >>> ${uri.fsPath}`);

        vscode.workspace.openTextDocument(uri.fsPath).then(
            document => {
                vscode.window.showTextDocument(document, { preview: false });
            },
            () => {
                // ! File path not exists, maybe deleted or renamed
                vscode.window.showErrorMessage(`Could not open file "${uri.fsPath}", maybe renamed or deleted`);
                console.error(`Could not open file, maybe renamed or deleted >>> ${uri.fsPath}`);

                // Remove the missing file from the view
                this.removePinnedDocumentItem(uri);
                this.refresh();
                this.save();
            },
        );
    }

    /**
     * Open all pinned documents
     */
    openAll() {
        console.debug(`Opening all documents`);

        for (let item of this.pinnedDocuments) {
            this.openDocument(item.uri);
        }
    }

    /**
     * Clear all pinned documents
     */
    clearAll() {
        this.pinnedDocuments = [];
        this.refresh();
        this.save();
    }

    /**
     * Refresh pinned document explorer view
     */
    refresh() {
        pinnedDocumentProvider.setItems(this.pinnedDocuments);
    }

    /**
     * Save pinned documents to config
     */
    save() {
        const rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            return;
        }

        let config = configService.get();

        // * If the save option is turned on
        if (config.maintainPinnedDocuments) {
            let paths = this.pinnedDocuments.map(x => {
                let relativePath = path.relative(rootPath, x.uri.fsPath);
                return relativePath;
            });
            configService.updatePinnedDocuments(paths);
        }
    }

    /**
     * Sort pinned document for the selected type
     * @param type - how you want sort it
     */
    sortBy(type: SortType) {
        if (type === SortType.NAME) {
            pinnedDocumentService.sortByName();
        } else if (type === SortType.TYPE) {
            pinnedDocumentService.sortByType();
        }
        pinnedDocumentService.refresh();
        pinnedDocumentService.save();
    }

    /**
     * Sort pinned documents if required
     */
    private sort() {
        let config = configService.get();
        let maintainSort = config.maintainSortOrder;
        let sortBy = config.sortBy;

        // Maintain sort order
        if (maintainSort) {
            this.sortBy(sortBy);
        }
    }

    private sortByName() {
        this.pinnedDocuments = this.pinnedDocuments.sort((a, b) => {
            let nameA = path.basename(a.uri.fsPath);
            let nameB = path.basename(b.uri.fsPath);
            return nameA.localeCompare(nameB);
        });

        configService.updateSortBy(SortType.NAME.toString());
    }

    private sortByType() {
        this.pinnedDocuments = this.pinnedDocuments.sort((a, b) => {
            let typeA = path.extname(a.uri.fsPath);
            let typeB = path.extname(b.uri.fsPath);
            return typeA.localeCompare(typeB);
        });

        configService.updateSortBy(SortType.TYPE.toString());
    }

    /**
     * Load saved pinned documents from last session
     */
    private load() {
        const rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            return;
        }

        let config = configService.get();
        if (config.maintainPinnedDocuments && config.pinnedDocuments) {
            let documents = config.pinnedDocuments;
            for (let doc of documents) {
                let name = path.basename(doc);
                let fileName = rootPath + "\\" + doc;
                let uri = Uri.file(fileName);
                let item = new PinnedDocumentTreeItem(
                    uri,
                    name,
                    {
                        title: "Open pinned document",
                        command: "smartOpen.pinnedDocument.viewItem.open",
                        arguments: [uri],
                    },
                    "smartOpen.pinnedDocument.viewItem.remove",
                );
                this.pinnedDocuments.push(item);
            }
        }
    }

    private findPinnedDocumentItem(uri: Uri): PinnedDocumentTreeItem {
        return this.pinnedDocuments.find(x => x.uri.fsPath === uri.fsPath);
    }

    private removePinnedDocumentItem(uri: Uri) {
        this.pinnedDocuments = this.pinnedDocuments.filter(x => x.uri.fsPath !== uri.fsPath);
    }
}

let pinnedDocumentService = new PinnedDocumentService();
export { pinnedDocumentService };
