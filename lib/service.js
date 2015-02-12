'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var Service = function(options){
	options = options || {};
	this.serviceRoot = options.serviceRoot || __dirname;
	this.methodDir = options.methodDir || path.join(this.serviceRoot,'methods');
	this.name = options.name;
	this.slug = options.slug;
	this.auth = options.auth;

	// Auto-load all our methods
	this.methods = [];
	this.requireMethods(this.methodDir);

	// Index the methods for speed
	this.methodsIndexed = _.indexBy(this.methods,'slug');
};

Service.prototype.registerMethod = function(config){
	this.methods.push(config);
};

Service.prototype.requireMethods = function(dir){
	var self = this;
	fs.readdirSync(dir).forEach(function(file){
		file = path.join(dir,file);
		var stat = fs.statSync(file);
		if(stat && stat.isDirectory()){
			self.requireMethods(file);
		}else if(/config.js$/.test(file)){
			require(file)(self);
		}
	});
};

Service.prototype.runMethod = function(method,script,data,options,cb){
	
};

module.exports = Service;