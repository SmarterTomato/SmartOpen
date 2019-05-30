import * as vscode from "vscode";
import { Rule } from "../model/rule";
import { Config } from "../model/config";

class ConfigService {
    get(): Config {
        let config = new Config();
        try {
            config.activatedTags = vscode.workspace.getConfiguration().get("smartOpen.activatedTags");

            let defaultRule: Rule = vscode.workspace.getConfiguration().get("smartOpen.rules.default");
            config.rules.push(defaultRule);

            let custom: Array<Rule> = vscode.workspace.getConfiguration().get("smartOpen.rules.custom");
            config.rules = config.rules.concat(custom);
        } catch (error) {
            console.exception(`Could not load configuration: ${error}`);
        }

        return config;
    }

    getActivatedRules(): Array<Rule> {
        let config = this.get();
        return config.rules.filter(x => x.tags.some(p => config.activatedTags.indexOf(p) >= 0));
    }
}

let configService = new ConfigService();
export { configService };
