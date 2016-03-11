'use strict';

var _ = require('lodash'),
    Poller = require('./poller'),
    mongoSanitize = require('express-mongo-sanitize'),
    FxoUtils = require('flowxo-utils');

/**
 * This ScriptRunner is used by the generator to run the script
 * for testing purposes. It is a lightweight replica of the core's
 * script runner, without {{ interpolation }} parsing, token
 * refreshing or automatic retrying on failure.
 */

var logger = require('./logger');
var MockScriptStore = require('./mockScriptStore');

var ScriptRunner = function(service, options) {
  this.service = service;
  this.options = options || {};
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
 * Supports the following:
 *  `run(methodSlug, script, options, cb)`
 *  `run(methodSlug, script, cb)`
 *  `run(script, options, cb)`
 *  `run(script, cb)`
 */
 /* jshint unused: false */
ScriptRunner.prototype.run = function(method, script, options, cb) {
  if(arguments.length === 2) {
    // Service-level script with no options.
    cb = script;
    options = {};
    script = method;
    method = null;

  } else if(arguments.length === 3) {
    cb = options;

    if(_.isString(arguments[1])) {
      // Method-level script with no options.
      options = {};

    } else {
      // Service-level script with options.
      options = script;
      script = method;
      method = null;
    }
  }

  options = options || {};

  // If there is no incoming authentication, use ours
  if(!options.credentials) {
    options.credentials = this.options.credentials;
  }

  options.logger = options.logger || logger;

  options.input = options.input || {};
  if(_.isArray(options.input)) {
    options.input = _.reduce(options.input, function(result, input) {
      if(input) {
        var val;

        // Parse any special types
        switch(input.type) {
          case 'datetime':
            val = FxoUtils.parseDateTimeField(input.value);
            break;

          case 'boolean':
            val = FxoUtils.parseBooleanField(input.value);
            break;

          default:
            val = input.value;
            break;
        }

        // Convert into an object map
        result[input.key] = val;
      }

      // Return for reduction
      return result;
    }, {});
  }

  if(mongoSanitize.has(options.input)) {
    return cb(new Error('ServiceDataError: input data must not contain keys beginning with \'$\' or containing \'.\'.'));
  }

  // ScriptStores are shared for individual methods.
  // This allows pollers to work correctly, but not interfere
  // with one another.
  options.scriptStore = this.getScriptStore(method);

  var done = function(err, output) {
    if(!err && output && mongoSanitize.has(output)) {
      return cb(new Error('ServiceDataError: output data must not contain keys beginning with \'$\' or containing \'.\'.'));
    }

    cb.apply(null, arguments);
  };

  return method ?
    this.service.runMethodScript(method, script, options, done) :
    this.service.runServiceScript(script, options, done);
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
