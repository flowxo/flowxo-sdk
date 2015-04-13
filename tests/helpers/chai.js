var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.should = chai.should();
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
