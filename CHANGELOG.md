# Change Log

## [1.5.0] - 2019-08-02

### Changed

* Pinned document now save related path
* Change pinned document json now stored into .vscode folder

## [1.3.2] - 2019-07-08

### Changed

* Extension now format regex for settings `smartOpen.openRelatedFile.fileFilters` and `smartOpen.openRelatedFile.ignoredFiles`
  * Now you can use `*`, `.`, `\` as normal
  * Updated `smartOpen.openRelatedFile.fileFilters` and `smartOpen.openRelatedFile.ignoredFiles` default values
  * !!! You need update your regex as well.

### Bug fixes

* Could not remove pinned document if no editor opened

## [1.3.0] - 2019-07-02

### Added

* New feature! - Pin documents
  * Pinned documents panel
  * Editor right click context menu

<img src="https://raw.githubusercontent.com/SmartyTomato/SmartOpen/master/resources/img/readme/readme_2.jpg" alt="Pinned documents">

## [1.2.0] - 2019-06-17

### Added

* Add built in rule for Javascript, match js, css, less, etc
* Add built in rule for C# Test, match Test.cs, Tests.cs

### Changed

* Update built in rule for Angular, now will match files component, service, model

## [1.1.3] - 2019-06-04

### Changed

* Improve results display order
* Now the `default rule` will be sort by filename
* Any rule order larger than 100 will be sort by filename
* Performance improvements

## [1.1.0] - 2019-06-04

### Added

* File filters
* Ignore files or folders

### Changed

* Significant performance improvements

## [1.0.0] - 2019-06-03

### Added

* Open related files using shortcut Ctrl + ;
* Add support for variables {number}, {-number},
* Built in tag for Angular, Default, C#, C++
* Allow custom tag to be created and used
