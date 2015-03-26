'use strict';

var winston = require('winston');
var MockScriptStore = require('./mockScriptStore');

var ScriptRunner = function(service,options){
	this.service = service;
	this.options = options || {};
	this.scriptStore = new MockScriptStore();
	this.logger = new (winston.Logger)();
};

ScriptRunner.prototype.run = function(method,script,options,cb){
	options = options || {};
	// If there is no incoming authentication, use ours
	if(!options.auth){
		options.auth = this.options.auth;
	}

	options.logger = options.logger || this.logger;
	options.scriptStore = options.scriptStore || this.scriptStore;
        options.input = options.input || {};

	return this.service.runMethod(method,script,options,cb);
};


module.exports = ScriptRunner;
