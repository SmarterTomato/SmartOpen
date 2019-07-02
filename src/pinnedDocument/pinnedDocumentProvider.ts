import * as vscode from "vscode";
import { TreeDataProvider } from "vscode";
import { PinnedDocumentTreeItem } from "./model/pinnedDocumentTreeItem";

/**
 * Explorer view provider
 */
class PinnedDocumentProvider implements TreeDataProvider<PinnedDocumentTreeItem> {
    onDidChangeTreeData: vscode.Event<PinnedDocumentTreeItem>;
    _onDidChangeTreeData: vscode.EventEmitter<PinnedDocumentTreeItem>;
    items: Array<PinnedDocumentTreeItem> = [];

    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter<PinnedDocumentTreeItem>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    setItems(items: Array<PinnedDocumentTreeItem>) {
        this.items = items;

        this.refresh();
    }

    getTreeItem(element: PinnedDocumentTreeItem): import("vscode").TreeItem | Thenable<import("vscode").TreeItem> {
        return element;
    }
    getChildren(element?: PinnedDocumentTreeItem): import("vscode").ProviderResult<PinnedDocumentTreeItem[]> {
        return this.items;
    }
    getParent?(element: PinnedDocumentTreeItem): import("vscode").ProviderResult<PinnedDocumentTreeItem> {
        return null;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

let pinnedDocumentProvider = new PinnedDocumentProvider();
export { pinnedDocumentProvider };
