class ReplaceString {
    search: string;
    replace: string;
}

class Utility {
    regexSpecialChars: Array<ReplaceString> = [
        { search: "*", replace: ".*" },
        { search: "\\", replace: "\\\\" },
        { search: ".", replace: "\\." },
    ];

    formatRegex(regex: string): string {
        return this.replaceAllBatch(regex, this.regexSpecialChars);
    }

    replaceAllBatch(text: string, matches: Array<ReplaceString>): string {
        let result = text;
        let end = -1;
        let match = null;

        for (let item of matches) {
            let found = text.indexOf(item.search);

            if (found >= 0 && (end === -1 || found < end)) {
                end = found + 1;
                match = item;
            }
        }

        if (end >= 0) {
            let selected = text.substring(0, end);
            selected = selected.replace(match.search, match.replace);

            let remaining = text.substring(end);
            if (remaining) {
                result = selected + this.replaceAllBatch(remaining, matches);
            } else {
                result = selected;
            }
        }

        return result;
    }
}

let utility = new Utility();
export { utility };
