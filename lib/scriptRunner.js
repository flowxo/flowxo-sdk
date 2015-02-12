'use strict';

var winston = require('winston');

var ScriptRunner = function(service,options){
	this.service = service;
	this.options = options || {};
};

ScriptRunner.prototype.run = function(method,script,options,cb){

	// If there is no incoming authentication, use ours
	if(!options.auth){
		options.auth = this.options.auth;
	}

	if(!options.logger){
		options.logger = new (winston.Logger)();
	}

	return this.service.runMethod(method,script,options,cb);
};


module.exports = ScriptRunner;
