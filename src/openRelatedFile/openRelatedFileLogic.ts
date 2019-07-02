import { Rule } from "./model/rule";
import { FileInfoQuickPickItem, SegmentType, FileSegment, FileInfo, MatchResult } from "./model/fileInfo";

class OpenRelatedFileLogic {
    wildcardRegExp = /[*]/g;
    expressionConstantRegExp = /{[\d]*}/g;
    expressionSimilarRegExp = /{-[\d]*}/g;
    expressionRegExp = /{[\d]*}|{-[\d]*}|[*]/g;

    /**
     * Get result if the name matches any rule expression
     * @param file - file info
     * @param rule - file match rule
     * @returns - match result
     */
    analysisFile(file: FileInfo, rule: Rule): MatchResult {
        console.debug(`Analysing file >>> ${file.relativePath}`);
        let result = new MatchResult(file, rule);

        let name = file.name;

        for (let expression of rule.expressions) {
            let valid = this.expressionRegExp.test(expression);
            if (!valid) {
                continue;
            }

            let expressionVariables = expression.match(this.expressionRegExp);
            let expressionConstants = expression.split(this.expressionRegExp);

            // * ignore empty string at the start and end
            if (!expressionConstants[0]) {
                expressionConstants.shift();
            }
            if (!expressionConstants[expressionConstants.length - 1]) {
                expressionConstants.pop();
            }

            let expressionVarIndex = 0;
            let expressionConstIndex = 0;
            let notMatch = false;
            while (expressionConstIndex < expressionConstants.length) {
                const expressionVar = expressionVariables[expressionVarIndex];
                const expressionConst = expressionConstants[expressionConstIndex];

                let start = name.indexOf(expressionConst);
                if (start < 0) {
                    // - not match, try next expression
                    notMatch = true;
                    break;
                } else if (start > 0) {
                    if (!expressionVar) {
                        // - not match, try next expression
                        notMatch = true;
                        break;
                    }

                    // - start with variable
                    let value = name.substring(0, start);
                    let matchSegment: FileSegment = {
                        type: SegmentType.VAR,
                        expression: expressionVar,
                        value: value,
                    };
                    result.segments.push(matchSegment);
                    name = name.substring(start);
                    expressionVarIndex++;
                } else {
                    // - start with constant
                    let matchSegment: FileSegment = {
                        type: SegmentType.CONST,
                        expression: expressionConst,
                        value: expressionConst,
                    };
                    result.segments.push(matchSegment);
                    name = name.substring(expressionConst.length);
                    expressionConstIndex++;
                }
            }

            // - not match this expression, try next one
            if (notMatch) {
                continue;
            }

            // - last element is constant, add the element to the end of the list
            if (expressionVarIndex < expressionVariables.length) {
                let matchSegment: FileSegment = {
                    type: SegmentType.VAR,
                    expression: expressionVariables[expressionVarIndex],
                    value: name,
                };
                result.segments.push(matchSegment);
            }

            // - only the first match needed
            result.isMatch = true;
            console.debug(`File matched Matched expression >>> ${expression}`);
            break;
        }

        return result;
    }

    /**
     * Check weather the two results match each other
     * @param file1
     * @param file2
     */
    areFileInfosMatch(file1: MatchResult, file2: MatchResult): boolean {
        console.debug(
            `Comparing file infos >>> file1=${file1.fileInfo.relativePath} | file2=${file2.fileInfo.relativePath}`,
        );

        // - for {-1}
        let variableSegments1 = file1.segments.filter(x => x.expression.match(this.expressionSimilarRegExp));
        let variableSegments2 = file2.segments.filter(x => x.expression.match(this.expressionSimilarRegExp));
        for (const seg1 of variableSegments1) {
            for (const seg2 of variableSegments2) {
                if (seg1.value === seg2.value) {
                    continue;
                }

                // * Get the number, must be a valid number this point
                let matchResult = seg1.expression.match(this.expressionSimilarRegExp)[0];
                let max = Number(matchResult.substring(1, matchResult.length - 1)) * -1;

                let array1 = this.breakString(seg1.value, file1.rule.breakChars);
                let array2 = this.breakString(seg2.value, file2.rule.breakChars);
                let count = this.calculateDifference(array1, array2);

                if (count > max) {
                    console.debug(
                        `Exceed the max allowed difference >>> seg1=${seg1.value} | seg2=${seg2.value} | max=${max}`,
                    );
                    return false;
                }
            }
        }

        // - for {1}
        variableSegments1 = file1.segments.filter(x => x.expression.match(this.expressionConstantRegExp));
        variableSegments2 = file2.segments.filter(x => x.expression.match(this.expressionConstantRegExp));
        for (const seg1 of variableSegments1) {
            for (const seg2 of variableSegments2) {
                if (seg1.value !== seg2.value) {
                    console.debug(`Segments are different >>> seg1=${seg1.value} | seg2=${seg2.value}`);
                    return false;
                }
            }
        }

        console.debug(`Files are matched`);
        return true;
    }

    private breakString(text: string, array: Array<string>): Array<string> {
        // * Make regex string from array
        let regexString = "[";
        let breakCap = false;
        for (const item of array) {
            if (item.toLowerCase() === "{cap}") {
                breakCap = true;
            } else {
                regexString += item;
            }
        }

        regexString += "]";

        // * {Cap}
        if (breakCap) {
            regexString += "|(?=[A-Z])";
        }

        let regex = new RegExp(regexString, "g");
        let result = text.split(regex);
        return result;
    }

    private calculateDifference(array1: Array<string>, array2: Array<string>): number {
        let count = 0;
        let differ1 = array1.filter(x => !array2.includes(x));
        let differ2 = array2.filter(x => !array1.includes(x));

        count = differ1.length + differ2.length;
        return count;
    }
}

let openRelatedFileLogic = new OpenRelatedFileLogic();
export { openRelatedFileLogic };
