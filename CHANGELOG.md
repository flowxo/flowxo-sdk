# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.2] - 2015-05-07
### Fixed
- Fixed a bug where nested outputs were not being displayed properly (all listed as undefined previously) 

## [1.1.1] - 2015-05-06
### Fixed
- Fixed a bug which occurred when `grunt run` is called on a method with a custom input script, but no regular input fields.

## [1.1.0] - 2015-05-06
### Changed
- Input field collection from `grunt run` now consolidates regular and custom input fields into a single list.
- The order of the outputs in the `LABELLED` section after `grunt run`ing a task now match the order that the outputs are defined in the service config.
- All keys defined in the service's output config are now displayed in the `LABELLED` section.
- `grunt run` no longer aborts when an error occurs when running a script. This allows errors to be tested using `grunt run --replay`.

### Fixed
- If no OAuth details are provided in the `.env` file, running `grunt auth` displays the correct env var keys, instead of `TRELLO_ID` and `TRELLO_SECRET`.

## 1.0.0 - 2015-04-23
### Added
- Initial release of the SDK.

[1.1.1]: https://github.com/flowxo/flowxo-sdk/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.0.0...v1.1.0
