'use strict';
var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    winston = require('winston'),
    Poller = require('./poller'),
    ServiceError = require('./error').ServiceError;

/**
 * Recurse through the passed method dir,
 * finding method config.
 * @param  {String} dir methods root directory
 * @return {Array}     paths to method config files
 */
var getMethodsFromDir = function(dir) {
  var methods = [];

  var findConfigFiles = function(dir) {
    fs.readdirSync(dir).forEach(function(file) {
      file = path.join(dir, file);
      var stat = fs.statSync(file);
      if(stat && stat.isDirectory()) {
        findConfigFiles(file);
      } else if(/config.js$/.test(file)) {
        methods.push(file);
      }
    });
  };

  findConfigFiles(dir);

  return methods;
};

/**
 * FlowXO SDK Service
 * @param {Object} options
 * @param {String} options.serviceRoot Path to root directory of service
 * @param {String} options.methodDir   Path to root directory of service methods
 *     Defaults to {{options.serviceRoot}}/methods
 * @param {String} options.name        Human-readable name of the service
 * @param {String} options.slug        Service Slug
 * @param {Object} options.auth        Authentication Options
 * @param {String} options.auth.type   Authentication Type. Either 'oauth1',
 *     'oauth2', 'credentials' or 'openid'
 *
 * @constructor
 */
var Service = function(options) {
  options = options || {};

  this.serviceRoot = options.serviceRoot;

  this.name = options.name;
  this.slug = options.slug;
  this.auth = options.auth;
  this.scripts = options.scripts || [];

  // Auto-load all our methods
  this.methodDir = path.join(this.serviceRoot, 'methods');
  this.methodOrder = options.methods;
  this.methods = [];
  this.loadMethods();

  // Index the methods for speed
  this.methodsIndexed = _.indexBy(this.methods, 'slug');
};

/**
 * Function called by methods to register with the service
 * @param  {Object} config
 * @param {String} name Human-readable method name
 * @param {String} slug Method slug
 * @param {String} type Method type, either 'poller','webhook' or 'action'
 *
 */
Service.prototype.registerMethod = function(config) {
  this.methods.push(config);
};

Service.prototype.loadMethods = function() {
  // Firstly, try to load the methods in order,
  // according to the method listing.
  var self = this;

  var methods;

  if(_.isArray(self.methodOrder)) {
    // Use the list of methods to require them in order.
    methods = self.methodOrder.map(function(m) {
      return path.join(self.methodDir, m, 'config.js');
    });

  } else {
    try {
      methods = getMethodsFromDir(self.methodDir);
    } catch(e) {
      methods = [];
      console.error(e);
    }
  }

  methods.forEach(function(m) {
    try {
      require(m)(self);
    } catch(e) {
      console.error('Could not load method:', e);
    }
  });

};

var ensureOptions = function(options) {
  return _.defaults(options || {}, {
    logger: new(winston.Logger)(),
    input: {},
    credentials: {}
  });
};

Service.prototype.runMethodScript = function(method, script, options, cb) {
  options = ensureOptions(options);

  // Check we have the method...
  if(!(this.methodsIndexed && this.methodsIndexed[method])) {
    return cb(new Error('ServiceError: Service ' + this.name + ' does not define method ' + method));
  }

  // ...and the script ...
  if(!(this.methodsIndexed[method].scripts && this.methodsIndexed[method].scripts[script])) {
    return cb(new Error('ServceError: Service ' + this.name + ' method ' + method + ' has no script for ' + script));
  }

  // If this is a poller, create a utility polling function
  if(this.methodsIndexed[method].type === 'poller' && options.scriptStore) {
    options.poller = Poller(options.scriptStore).filterNewData;
  }

  var fn = this.methodsIndexed[method].scripts[script];

  return fn.call(this, options, cb);
};

Service.prototype.runServiceScript = function(script, options, cb) {
  options = ensureOptions(options);

  // Check we have this service script
  if(!this.scripts.hasOwnProperty(script)) {
    return cb(new Error('ServiceError: Service ' + this.name + ' does not define script "' + script + '"'));
  }

  if(!_.isFunction(this.scripts[script])) {
    return cb(new Error('ServiceError: Script must be a function'));
  }

  return this.scripts[script].call(this, options, cb);
};

/**
 * [runScript description]
 * @return {Promise}
 */
Service.prototype.runScript = function() {
  if(arguments.length === 4) {
    return this.runMethodScript.apply(this, arguments);
  } else if(arguments.length === 3) {
    return this.runServiceScript.apply(this, arguments);
  }
};

var scriptReducer = function(scripts) {
  return Object.keys(scripts)
    .reduce(function(scripts, scriptName) {
      scripts[scriptName] = true;
      return scripts;
    }, {});
};

/*
 * This is so the service can be serialized to the database in the manner
 * the old services used to
 * @return {Object}
 */
Service.prototype.toJSON = function() {
  var config = _.omit(this, ['auth', 'scripts', 'methods']);

  config.auth = _.omit(this.auth, ['strategy', 'options']);
  config.scripts = scriptReducer(this.scripts);

  config.methods = this.methods.map(function(m) {
    m = _.omit(m, ['scripts']);
    m.scripts = scriptReducer(m.scripts);
    return m;
  });


  return config;
};

/**
 * Function to get a method configuration by it's slug
 */
Service.prototype.getMethod = function(slug) {
  return this.methodsIndexed[slug];
};

Service.prototype.validate = require('./validate');

Service.prototype.validateScriptInput = function(data, constraints, options) {
  var errors = this.validate(data, constraints, options);
  if(errors) {
    return new ServiceError(errors.join(', '));
  }
};

module.exports = Service;
