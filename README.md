# SmartOpen README

Smart Open is a vscode extension help user better manage opened files

## Features

### Open related files

Open related files using "Ctrl + ;"

<img alt="Open related files"
      src="https://github.com/SmartyTomato/SmartOpen/blob/master/resources/img/readme/readme_1.png">

Just install from the Vscode extension marketplace

## Extension Settings

* `activatedTags`: Current activated tags from defined rules. Multiple rule can be applied. Use "all" apply all rules in the settings
* `smartOpen.fileFilters`: (Remove) first item to Enable. Only include file name, full path and relative path with the given regexp, add this to significant reduce the calculation time
* `smartOpen.ignoredFiles`: Ignored search path, add this to significant reduce the calculation time
* `rules.builtIn`: Builtin rules. Use as you wish, just add it into activated tags
* `rules.custom`: Custom rules. Don't forget add this into activatedTags to enable it
  * `tags`: Array of tags use to identify the rule
  * `order`: Result will show in this order. Smaller number wil show first. Default to 1 for a custom rule
  * `breakChars`: The character that breaks in the file path
  * `expressions`: Expressions to match file names. {1} exact match. {-2} relative match, Test1 and Test = {-1}. Test1 and Test2 = {-2}. - matching is very slow

## Known Issues

* File display multiple times

### Performance issues

Due to the single thread limitation, the performance for this extension depends on the number of files in the workspace. You will have performance issue for around 10k-20k files in the workspace. I will try to get as fast as possible. If you still have performance issue, try following:

* In vscode settings, search for `smartOpen.fileFilters`. Remove the first element (which includes all), add the file type you want. Make sure `*` put `.*` as its Javascript RegExp
* In vscode settings, search for `smartOpen.ignoredFiles`. Add folder you don't need to scan. This will significant improve performance. E.g. node_modules, .git
* Don't use similar comparison like {-1}, {-2}
* Don't use `default` tag

## Release Notes

## [1.1.0] - 2019-06-04

### Added

* File filters
* Ignore files or folders

### Changed

* Significant performance improvements

[CHANGELOG]: https://github.com/smartytomato/smartopen/CHANGELOG.md
