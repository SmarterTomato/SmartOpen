import * as vscode from "vscode";
import * as fs from "fs";

import { utility } from "./utility";
import { Rule } from "../openRelatedFile/model/rule";
import { Config } from "./model/config";

const defaultConfig: any = {
    pinnedDocument: { sortBy: "0", pinnedDocuments: [] },
};

class ConfigService {
    configFilePath = vscode.workspace.rootPath + "/.vscode/smartopen.json";

    get(): Config {
        console.debug(`Loading configs`);

        let config = new Config();
        try {
            let workspaceConfig = vscode.workspace.getConfiguration();

            // #region openRelatedFile

            config.activatedTags = workspaceConfig.get("smartOpen.openRelatedFile.activatedTags");
            config.ignoredFiles = workspaceConfig.get("smartOpen.openRelatedFile.ignoredFiles");
            config.fileFilters = workspaceConfig.get("smartOpen.openRelatedFile.fileFilters");

            let builtIn: Array<Rule> = workspaceConfig.get("smartOpen.openRelatedFile.rules.builtIn");
            config.rules = builtIn;

            let custom: Array<Rule> = workspaceConfig.get("smartOpen.openRelatedFile.rules.custom");
            config.rules = config.rules.concat(custom);

            // #endregion openRelatedFile

            // #region pinnedDocument

            config.maintainPinnedDocuments = workspaceConfig.get("smartOpen.pinnedDocument.maintainPinnedDocuments");
            config.maintainSortOrder = workspaceConfig.get("smartOpen.pinnedDocument.maintainSortOrder");

            try {
                config.sortBy = this.getConfig().pinnedDocument.sortBy;
                config.pinnedDocuments = this.getConfig().pinnedDocument.pinnedDocuments;
            } catch (error) {
                console.error(`File read failed: ${error}`);
                this.writeConfig(JSON.stringify(defaultConfig));
            }

            // #endregion pinnedDocument
        } catch (error) {
            console.exception(`Could not load configurations: ${error.toString()}`);
        }

        console.debug(`Configs loaded, ${config.rules} rules available`);
        return config;
    }

    getActivatedRules(): Array<Rule> {
        let config = this.get();
        if (config.activatedTags.includes("all")) {
            return config.rules;
        } else {
            return config.rules.filter(x => x.tags.some(p => config.activatedTags.includes(p)));
        }
    }

    getFileFilters(): Array<string> {
        let config = this.get();

        let filters = [];
        for (let item of config.fileFilters) {
            filters.push(utility.formatRegex(item));
        }

        return filters;
    }

    getIgnoredFiles(): Array<string> {
        let config = this.get();

        let ignoredFiles = [];
        for (let item of config.ignoredFiles) {
            ignoredFiles.push(utility.formatRegex(item));
        }

        return ignoredFiles;
    }

    updatePinnedDocuments(value: Array<string>) {
        let data: any = this.getConfig();
        data.pinnedDocument.pinnedDocuments = value;
        this.writeConfig(JSON.stringify(data));
    }

    private getConfig(): any {
        if (!fs.existsSync(this.configFilePath)) {
            fs.writeFile(this.configFilePath, defaultConfig, () => {});
            return {};
        }

        try {
            let config = fs.readFileSync(this.configFilePath).toString();
            return JSON.parse(config);
        } catch (err) {
            console.error(`File read failed: ${err}`);
            return {};
        }
    }

    private writeConfig(data: string) {
        try {
            fs.writeFileSync(this.configFilePath, data, "utf8");
        } catch (err) {
            console.error(`File write failed: ${err}`);
        }
    }
}

let configService = new ConfigService();
export { configService };
