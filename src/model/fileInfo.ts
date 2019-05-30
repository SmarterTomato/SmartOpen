import { Rule } from "./rule";
import { QuickPickItem } from "vscode";

export class FileInfoItem implements QuickPickItem {
    isMatch: boolean = false;
    rule: Rule;
    name: string;
    fullPath: string;
    relativePath: string;
    segments = new Array<FileSegment>();

    label: string;
    description: string;

    constructor(name: string, fullPath: string, relativePath: string) {
        this.name = name;
        this.fullPath = fullPath;
        this.relativePath = relativePath;
        this.label = name;
        this.description = relativePath;
    }
}

export class FileSegment {
    type: SegmentType;
    expression: string;
    value: string;
}

export enum SegmentType {
    CONST,
    VAR,
}
