# SmartOpen README

Smart Open is a vscode extension help user better manage opened files

## Features

### Open related files

Open related files using "Ctrl + ;"
![alt](https://github.com/smartytomato/smartopen/resources/img/readme/readme_1.jpg)

## Requirements

Just install from the Vscode extension marketplace

## Extension Settings

* `activatedTags`: Current activated tags from defined rules. Multiple rule can be applied. Use "all" apply all rules in the settings
* `rules.builtIn`: Builtin rules. Use as you wish, just add it into activated tags
* `rules.custom`: Custom rules. Don't forget add this into activatedTags to enable it
  * `tags`: Array of tags use to identify the rule
  * `order`: Result will show in this order. Smaller number wil show first. Default to 1 for a custom rule
  * `breakChars`: The character that breaks in the file path
  * `expressions`: Expressions to match file names. {1} exact match. {-2} relative match, Test1 and Test = {-1}. Test1 and Test2 = {-2}. - matching is very slow

## Known Issues

## Release Notes

### Added

* Open related files using shortcut Ctrl + ;
* Add support for variables {number}, {-number},
* Built in tag for Angular, Default, C#, C++
* Allow custom tag to be created and used

### 1.0.0

* Open related files using shortcut Ctrl + ;
* Add support for variables {number}, {-number},
* Built in tag for Angular, Default, C#, C++
* Allow custom tag to be created and used
