import { QuickPickItem, Uri } from "vscode";
import * as path from "path";

export class PinnedDocumentQuickPickItem implements QuickPickItem {
    label: string;
    description: string;

    uri: Uri;

    constructor(uri: Uri) {
        this.uri = uri;

        let name = path.basename(uri.fsPath);
        this.label = name;
        this.description = uri.fsPath;
    }
}
