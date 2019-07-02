import { TreeItem, Uri, Command } from "vscode";

export class PinnedDocumentTreeItem extends TreeItem {
    constructor(public uri: Uri, public label: string, public command: Command, public contextValue: string) {
        super(label);

        this.tooltip = uri.fsPath;
        this.resourceUri = uri;
    }
}
