'use strict';

var winston = require('winston');
var MockScriptStore = require('./mockScriptStore');

var ScriptRunner = function(service,options){
	this.service = service;
	this.options = options || {};
	this.scriptStore = new MockScriptStore();
	this.logger = new (winston.Logger)();
};

/**
 * Run a service script or method
 * Takes either 3 or 4 parameters. If 3 then it's a service
 * scripts, else a method script
 *
 * @param  {[type]} method  [description]
 * @param  {[type]} script  [description]
 * @param  {[type]} options [description]
 * @param  {[type]} cb 			[description]
 * @return {[type]}         [description]
 */
ScriptRunner.prototype.run = function(method,script,options){

	if(arguments.length === 3){
		options = arguments[1];
	}

	// If there is no incoming authentication, use ours
	if(!options.credentials){
		options.credentials = this.options.credentials;
	}

	options.logger = options.logger || this.logger;
	options.scriptStore = options.scriptStore || this.scriptStore;
  options.input = options.input || {};

	return this.service.runScript.apply(this.service,arguments);
};

/**
 * Populate the data in the poller cache
 */
ScriptRunner.prototype.setPollerCache = function(data) {
	this.scriptStore.set('__pollids__',data);
};

module.exports = ScriptRunner;
