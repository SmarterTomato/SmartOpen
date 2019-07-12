import { Rule } from "../../openRelatedFile/model/rule";
import { SortType } from "../../pinnedDocument/model/sortType";

export class Config {
    activatedTags = new Array<string>();
    fileFilters = new Array<string>();
    ignoredFiles = new Array<string>();
    rules = new Array<Rule>();

    sortBy: SortType;
    maintainSortOrder: boolean;
    maintainPinnedDocuments: boolean;
    pinnedDocuments = new Array<string>();
}
