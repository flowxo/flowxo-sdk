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
	this.methods = options.methods || [];
	this.requireMethods(this.methodDir);

	// Index the methods for speed
	this.methodsIndexed = _.indexBy(this.methods,'slug');
};

Service.prototype.registerMethod = function(config){
	this.methods.push(config);
};

Service.prototype.requireMethods = function(dir){
	var self = this;
	try{
		fs.readdirSync(dir).forEach(function(file){
			file = path.join(dir,file);
			var stat = fs.statSync(file);
			if(stat && stat.isDirectory()){
				self.requireMethods(file);
			}else if(/config.js$/.test(file)){
				require(file)(self);
			}
		});
	}catch(e){

	}
};

Service.prototype.runMethodScript = function(method,script,options,cb){
	// Check we have the method...
	if(!(this.methodsIndexed && this.methodsIndexed[method])){
		return cb(new Error('ServiceError: Service ' + this.name + ' does not define method ' + method));
	}

	// ...and the script ...
	if(!(this.methodsIndexed[method].scripts && this.methodsIndexed[method].scripts[script])){
		return cb(new Error('ServceError: Service ' + this.name + ' method ' + method + ' has no script for ' + script));
	}

	var fn = this.methodsIndexed[method].scripts[script];

	return fn.call(this,options,cb);
};

/*
 * This is so the service can be serialized to the database in the manner 
 * the old services used to
 */
Service.prototype.toJSON = function(){
	var config = {
		name: this.name,
		slug: this.slug,
		auth: {
			type: this.auth.type
		}
	};

	if(this.auth.type === 'credentials'){
		this.auth.fields = this.auth.fields;
	}

	config.methods = this.methods.map(function(m){
		m = _.assign({},m);
		delete m.scripts;
		return m;
	});

	return config;
};

module.exports = Service;