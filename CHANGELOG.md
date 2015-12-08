# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [3.6.1] - 2015-12-08
### Fixed
- Method scripts not being jsonified correctly.

## [3.6.0] - 2015-12-08
**Deprecation warning** - this release contains a bug and should not be used.

### Added
- Ability to order methods.
- `help` property is now allowed on service configuration.

## [3.5.3] - 2015-11-03
### Fixed
- `lodash` referenced incorrectly in assertions.

## [3.5.2] - 2015-11-02
### Fixed
- Something didn't commit properly in 3.5.1.

## [3.5.1] - 2015-11-02
### Fixed
- Relaxed method field input_options value validation. Can now be a number or boolean as well as a non-empty string.

## [3.5.0] - 2015-10-30
### Added
- Allow `options.scriptStore` in method scripts.

## [3.4.1] - 2015-10-29
### Fixed
- Rules on method input field structure have been tightened, in line with core platform requirements:
  - `key` must be a non-empty string
  - `label` must be a non-empty string
  - `type` must be a valid type
  - `input_options` must be an array of objects
  - For each `input_option`:
    - `label` must be a non-empty string
    - `value` must be a non-empty string

## [3.4.0] - 2015-10-29
### Updated
- It is now easier to setup an OAuth service to use an SSL-based callback.

## [3.3.0] - 2015-10-27
### Updated
- `validate.js` dependency to v0.9.0.

### Added
- Built-in datetime validator, after the move to `validate.js` v0.9.0.

## [3.2.2] - 2015-10-27
### Fixed
- Use `cross-spawn-async` to prevent build toolchain requirement.
- Moved `cross-spawn-async` to `dependencies` map so it can be used by service when `grunt init` is called.

### Updated
- Dependencies.

## [3.2.1] - 2015-10-19
### Fixed
- Use `cross-spawn` for better Windows compatibility.
- Log error when registering method.

## [3.2.0] - 2015-10-14
### Added
- Select fields that do not have `dependants: true` can now be input manually, instead of forcing an option to be chosen.

## [3.1.0] - 2015-10-08
### Added
- Support for entering an empty string input for the `grunt run` task. Enter `''` or `""` as input data for a field to enable this behaviour.

## [3.0.2] - 2015-10-06
### Fixed
- Dictionary field icon for `grunt run`.

## [3.0.1] - 2015-10-05
### Added
- Support for node v4.

## [3.0.0] - 2015-10-05
### Added
- Dictionary input field.
- Test code coverage.
- Travis CI integration.

### Removed
- Private API objects `SDK.ScriptRunner` and `SDK.Chai`, which are no longer needed for service development.

### Fixed
- `credentials.json` file no longer needs to be generated prior to using `grunt run`.

## [2.1.0] - 2015-09-23
### Added
- Validation for dependant fields: should only belong to a select field.

## [2.0.3] - 2015-09-22
### Fixed
- Webhook triggers now run their corresponding run script when fired.

## [2.0.2] - 2015-09-22
### Updated
- Updated dependencies.

## [2.0.1] - 2015-09-15
### Fixed
- `console.err` should have been `console.error`

### Changed
 - Improved documentation.

## [2.0.0] - 2015-08-18
### Removed
Flow XO services are no longer unit testable, instead the preferred way of testing is via the `grunt run` command.

This is a breaking change, hence the major version number bump.

## [1.5.0] - 2015-08-07
### Added
- `input.js` scripts now receive all collected input fields when being run.

### Changed
- `target` property in `input.js options` variable has changed from an object containing the target field's key and value to a string containing the key of the field that changed. Fetch the value of this field in the new `fields` hashmap.

## [1.4.0] - 2015-08-05
### Added
- Support for variable dependant fields.

## [1.3.5] - 2015-07-29
### Added
- Support for `https` OAuth server URL.

## [1.3.4] - 2015-07-28
### Fixed
- Datetime and Boolean validators now work correctly when they are `required` fields.

## [1.3.3] - 2015-06-30
### Fixed
- `grunt run --record` now works correctly when entering an empty value for a custom input field which has a dependency on another input.

## [1.3.2] - 2015-05-20
### Fixed
- `grunt run --single` now works correctly, and for dynamic inputs.

## [1.3.1] - 2015-05-19
### Fixed
- Ensure that method config always defines a run script.

## [1.3.0] - 2015-05-18
### Added
- Support dependant input fields - field config which depends upon the values of parent fields.
- Validation helper methods.

## [1.2.3] - 2015-05-14
### Added
- Input fields used when recording are now displayed when running in replay mode.

## [1.2.2] - 2015-05-13
### Fixed
- User profile should be `user_profile` instead of `profile`.

## [1.2.1] - 2015-05-12
### Fixed
- Fix issue with recording a test method run with empty inputs.

## [1.2.0] - 2015-05-12
### Added
- Support for webhook triggers.

## [1.1.2] - 2015-05-07
### Fixed
- Fixed a bug in displaying nested outputs.

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

[3.6.1]: https://github.com/flowxo/flowxo-sdk/compare/v3.6.0...v3.6.1
[3.6.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.5.3...v3.6.0
[3.5.3]: https://github.com/flowxo/flowxo-sdk/compare/v3.5.2...v3.5.3
[3.5.2]: https://github.com/flowxo/flowxo-sdk/compare/v3.5.1...v3.5.2
[3.5.1]: https://github.com/flowxo/flowxo-sdk/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.4.1...v3.5.0
[3.4.1]: https://github.com/flowxo/flowxo-sdk/compare/v3.4.0...v3.4.1
[3.4.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.2.2...v3.3.0
[3.2.2]: https://github.com/flowxo/flowxo-sdk/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/flowxo/flowxo-sdk/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/flowxo/flowxo-sdk/compare/v3.0.2...v3.1.0
[3.0.2]: https://github.com/flowxo/flowxo-sdk/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/flowxo/flowxo-sdk/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/flowxo/flowxo-sdk/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/flowxo/flowxo-sdk/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/flowxo/flowxo-sdk/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/flowxo/flowxo-sdk/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/flowxo/flowxo-sdk/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.5...v1.4.0
[1.3.5]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.4...v1.3.5
[1.3.4]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/flowxo/flowxo-sdk/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.2.3...v1.3.0
[1.2.3]: https://github.com/flowxo/flowxo-sdk/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/flowxo/flowxo-sdk/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/flowxo/flowxo-sdk/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/flowxo/flowxo-sdk/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/flowxo/flowxo-sdk/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/flowxo/flowxo-sdk/compare/v1.0.0...v1.1.0
