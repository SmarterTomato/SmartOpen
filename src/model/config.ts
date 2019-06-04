import { Rule } from "./rule";

export class Config {
    activatedTags = new Array<string>();
    fileFilters = new Array<string>();
    ignoredFiles = new Array<string>();
    rules = new Array<Rule>();
}
