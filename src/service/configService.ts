import * as vscode from "vscode";
import { Rule } from "../model/rule";
import { Config } from "../model/config";

class ConfigService {
    get(): Config {
        console.debug(`Loading configs`);

        let config = new Config();
        try {
            config.activatedTags = vscode.workspace.getConfiguration().get("smartOpen.activatedTags");
            config.ignoredFiles = vscode.workspace.getConfiguration().get("smartOpen.ignoredFiles");
            config.fileFilters = vscode.workspace.getConfiguration().get("smartOpen.fileFilters");

            let builtIn: Array<Rule> = vscode.workspace.getConfiguration().get("smartOpen.rules.builtIn");
            config.rules = builtIn;

            let custom: Array<Rule> = vscode.workspace.getConfiguration().get("smartOpen.rules.custom");
            config.rules = config.rules.concat(custom);
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
        return config.fileFilters;
    }

    getIgnoredFiles(): Array<string> {
        let config = this.get();
        return config.ignoredFiles;
    }
}

let configService = new ConfigService();
export { configService };
