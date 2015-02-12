'use strict';

var ScriptRunner = function(service,options){
	this.service = service;
	this.options = options || {};
};

ScriptRunner.prototype.run = function(method,script,options,cb){
	return this.service.runMethod(method,script,options,cb);
};


module.exports = ScriptRunner;