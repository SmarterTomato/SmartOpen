import { Rule } from "./rule";
import { QuickPickItem } from "vscode";

export class FileInfo {
    name: string;
    fullPath: string;
    relativePath: string;

    constructor(name: string, fullPath: string, relativePath: string) {
        this.name = name;
        this.fullPath = fullPath;
        this.relativePath = relativePath;
    }
}

export class MatchResult {
    fileInfo: FileInfo;
    isMatch: boolean = false;
    rule: Rule;
    segments = new Array<FileSegment>();

    constructor(fileInfo: FileInfo, rule: Rule) {
        this.fileInfo = fileInfo;
        this.rule = rule;
    }
}

export class FileInfoQuickPickItem implements QuickPickItem {
    fileInfo: FileInfo;

    label: string;
    description: string;

    constructor(fileInfo: FileInfo) {
        this.fileInfo = fileInfo;
        this.label = fileInfo.name;
        this.description = fileInfo.relativePath;
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
