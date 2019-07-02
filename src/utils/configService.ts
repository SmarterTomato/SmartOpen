import * as vscode from "vscode";
import { Uri } from "vscode";

import { Rule } from "../openRelatedFile/model/rule";
import { Config } from "./model/config";

class ConfigService {
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

            config.sortBy = workspaceConfig.get("smartOpen.pinnedDocument.sortBy");
            config.maintainSortOrder = workspaceConfig.get("smartOpen.pinnedDocument.maintainSortOrder");
            config.maintainPinnedDocuments = workspaceConfig.get("smartOpen.pinnedDocument.maintainPinnedDocuments");
            config.pinnedDocuments = workspaceConfig.get("smartOpen.pinnedDocument.pinnedDocuments");

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

    updateSortBy(value: string) {
        vscode.workspace.getConfiguration().update("smartOpen.pinnedDocument.sortBy", value);
    }

    updatePinnedDocuments(value: Array<string>) {
        vscode.workspace.getConfiguration().update("smartOpen.pinnedDocument.pinnedDocuments", value);
    }
}

let configService = new ConfigService();
export { configService };
