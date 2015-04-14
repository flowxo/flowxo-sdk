'use strict';

var _ = require('lodash'),
    FxoUtils = require('flowxo-utils');

/**
 * This ScriptRunner is used by the generator to run the script
 * for testing purposes. It is a lightweight replica of the core's
 * script runner, without {{ interpolation }} parsing, token
 * refreshing or automatic retrying on failure.
 */

var winston = require('winston');
var MockScriptStore = require('./mockScriptStore');

var ScriptRunner = function(service, options) {
  this.service = service;
  this.options = options || {};
  this.scriptStore = new MockScriptStore();
  this.logger = new(winston.Logger)();
};

/**
 * Run a service script or method.
 * Takes either 3 or 4 parameters.
 * If 3 then it's a service script, else a method script.
 */
 /* jshint unused: false */
ScriptRunner.prototype.run = function(method, script, options, cb) {
  var isMethodScript = (arguments.length === 4);
  if(!isMethodScript) {
    options = arguments[1];
  }

  options = options || {};

  // If there is no incoming authentication, use ours
  if(!options.credentials) {
    options.credentials = this.options.credentials;
  }

  options.logger = options.logger || this.logger;
  options.scriptStore = options.scriptStore || this.scriptStore;
  options.input = options.input || {};

  if(isMethodScript && _.isArray(options.input)) {
    // For each data input, if the field is of type
    // 'datetime' or 'boolean', run it through the parser.
    options.input = _.reduce(options.input, function(result, input) {
      if(input) {
        var val = input.value;

        // Parse any special types
        switch(input.type) {
          case 'datetime':
            val = FxoUtils.parseDateTimeField(val);
            break;

          case 'boolean':
            val = FxoUtils.parseBooleanField(val);
            break;

          default:
            break;
        }

        // Convert into an object map
        result[input.key] = val;
      }

      // Return for reduction
      return result;
    }, {});
  }

  return this.service.runScript.apply(this.service, arguments);
};
 /* jshint unused: true */

/**
 * Populate the data in the poller cache
 */
ScriptRunner.prototype.setPollerCache = function(data) {
  this.scriptStore.set('__pollids__', data);
};

module.exports = ScriptRunner;
