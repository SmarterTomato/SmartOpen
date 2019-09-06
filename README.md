# SmartOpen README

Smart Open is a vscode extension help user better manage opened documents

## Features

### Sync with explorer

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/sync_active_document.gif" alt="Sync active document">

Sync active document with explorer, so you can locate your file quickly.
vscode removed this feature since 07/2019

Shortcuts:

* Sync with explorer: `Ctrl + Alt + ;`

### Pin documents

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/pin_document.gif" alt="Pinned documents">

Pin documents to the top of the explorer panel using shortcut and then quick pick pinned documents with shortcut to boost your productivity.

Shortcuts:

* Pin: `Ctrl + '`
* Unpin: `Ctrl + shift + '`
* Quick pick pinned documents: `Ctrl + alt + '`
* Open all pinned documents: `Ctrl + shift + alt + '`

Note:

* If you want the panel on the top, drag and drop "pinned documents" view to the top.
* This feature work best with ZEN mode with small number of focused documents.
* You can close all other tab and reopen pinned documents to keep your workspace clean.

### Open related files

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/open_related_documents.gif" alt="Open related documents">

Shortcuts:

Open related files: `Ctrl + ;`

E.g.

* example.component.ts, example.component.html, example.component.css
* example.service.ts, example.component.ts
* ExampleController.h, ExampleController.cpp
* ExampleController.cs, ExampleLogic.cs, ExampleRepository.cs
* IExample.cs, Example.cs

## Extension Settings

### Sync with explorer

* `smartOpen.syncActiveDocument.enabled`:
  * Description: Enable sync with explorer
  * Default: true
  * Options: true or false

### Pin documents

* `smartOpen.pinnedDocument.enabled`:
  * Description: Enable pinned documents panel in explorer
  * Default: true
  * Options: true or false

* `smartOpen.pinnedDocument.maintainPinnedDocuments`:
  * Description: Should pinned documents maintained from last session after workspace closed or restarted
  * Default: true
  * Options: true or false

* `smartOpen.pinnedDocument.maintainSortOrder`:
  * Description: Should maintain sort order for pinned documents in the view when new document pinned
  * Default: false
  * Options: true or false

### Open related files

* `activatedTags`:
  * Description: Activated rule's tags used for calculate related files. Use `all` apply all rules in the settings
  * Default: all
  * Options: `all`, any tag from `rules.builtIn` and `rules.custom`


* `smartOpen.openRelatedFile.fileFilters`:
  * Description: Filter file name, full path and relative path with given regex, this will significant reduce the calculation time. Copy over and remove first item `.*` to enable
  * Default: `.*` allow any file
  * Options: Javascript regular expression, will change this later

* `smartOpen.openRelatedFile.ignoredFiles`:
  * Description: Ignored search path, add this to significant reduce the calculation
  * Default: Few common built in ones. E.g. node_modules, __*, .*, debug, build, release, etc
  * Options: Javascript regular expression, will change this later

* `rules.builtIn`:
  * Description: Builtin rules. Use as you wish, just add tag into activated tags
  * Default: Few common built in ones. E.g. Angular, Javascript, C#, C++, etc
  * Options: Don't edit this. Add in `rules.custom` instead

* `rules.custom`:
  * Description: Custom rules. To add new one, copy built in rule and edit it. Don't forget add this into activatedTags to enable it
  * Options: array of objects contains following properties. Look at `rules.builtIn` for example
    * `tags`:
      * Description: Array of string tags use to identify the rule.
      * Default:
      * Options: Usually use `language` plus `function`. E.g. ["`Javascript`", "`Angular`"]

    * `order`:
      * Description: Result will show in this order. Smaller number will show first.
      * Default: 10
      * Options: If number large than 100, the result will in alphabetic order

    * `breakChars`:
      * Description: The character that breaks in the file name into segments
      * Default: `-`, `_`, `.`, `{Cap}`
      * Options: Any character

    * `expressions`:
      * Description: Expressions to match file names, see `rules.builtIn` as example.
      * Default:
      * Options:
        * `{1}` exact match.
        * `{-1}` relative match.
        * E.g. Test1 and Test you should use `Test{-1}`. Test1 and Test2 you should use `{-2}`.
        * `{-1}` matching is very slow

## Known Issues

### Performance issues

Due to the single thread limitation, the performance for this extension depends on the number of files in the workspace. You will have performance issue for around 10k-20k files in the workspace. I will try to get as fast as possible. If you still have performance issue, try following:

* In vscode settings, search for `smartOpen.openRelatedFile.fileFilters`. Remove the first element (which includes all), add the file type you want. Make sure `*` put `.*` as its Javascript RegExp
* In vscode settings, search for `smartOpen.openRelatedFile.ignoredFiles`. Add folder you don't need to scan. This will significant improve performance. E.g. node_modules, .git
* Don't use similar comparison like {-1}, {-2}
* Don't use `default` tag

## Contacts

For any issues or suggestions, contact me via following method:

Email: smartytomato@hotmail.com

Git: [SmartOpen](https://github.com/SmartyTomato/SmartOpen/)

Send me through your configs I will make them built in.

## Release Notes

### Added

* New feature! - Sync with explorer `Ctrl + Alt + ;`
  * Sync active document with explorer (vscode removed this feature we loved since 07/2019)

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/sync_active_document.gif" alt="Sync active document">

* Add open related file to editor context menu

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/open_related_documents.gif" alt="Open related documents">

## Change Log

[CHANGELOG](https://github.com/smartytomato/smartopen/CHANGELOG.md)
