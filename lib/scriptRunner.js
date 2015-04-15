'use strict';

var _ = require('lodash'),
    Poller = require('./poller'),
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
  this.logger = new(winston.Logger)();
};

// Keep a cache of scriptstores.
// Each method has its own scriptstore.
var scriptStores = {};

ScriptRunner.prototype.getScriptStore = function(method) {
  var scriptStoreKey = this.service.slug;
  if(method) {
    scriptStoreKey += '_' + method;
  }

  // Create the scriptStore, if it does not already exist.
  if(!scriptStores[scriptStoreKey]) {
    scriptStores[scriptStoreKey] = new MockScriptStore();
  }

  return scriptStores[scriptStoreKey];
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


  // ScriptStores are shared for individual methods.
  // This allows pollers to work correctly, but not interfere
  // with one another.
  options.scriptStore = this.getScriptStore(method);

  return this.service.runScript.apply(this.service, arguments);
};
 /* jshint unused: true */

/**
 * Populate the data in the poller cache
 */
ScriptRunner.prototype.setPollerCache = function(method, data) {
  var scriptStore = this.getScriptStore(method);
  Poller(scriptStore).setCache(data);
};

module.exports = ScriptRunner;
