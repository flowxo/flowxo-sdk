'use strict';

var winston = require('winston');

var ScriptRunner = function(service,options){
	this.service = service;
	this.options = options || {};
};

var MockScriptStore = function(){
	this.data = {};
};

MockScriptStore.prototype.get = function(key,cb){
	cb(null,(this.data && this.data[key] || null));
};

MockScriptStore.prototype.set = function(key,value,cb){
	this.data[key] = value;
	cb();
};

MockScriptStore.prototype.del = function(key,cb){
	delete this.data[key];
	cb();
};

ScriptRunner.prototype.run = function(method,script,options,cb){

	// If there is no incoming authentication, use ours
	if(!options.auth){
		options.auth = this.options.auth;
	}

	if(!options.logger){
		options.logger = new (winston.Logger)();
	}

	if(!options.scriptStore){
		options.scriptStore = new MockScriptStore;
	}

	return this.service.runMethod(method,script,options,cb);
};


module.exports = ScriptRunner;
