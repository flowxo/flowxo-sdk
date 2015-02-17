'use strict';

var Q = require('q'),
    moment = require('moment'),
    _ = require('lodash'),
    Utils = {};

Utils.parseInteger = function(data,field,options){
	options = options || {};
	if(_.isUndefined(data)){
		if(options.required === true){
			throw "The required value '" + field + "' was missing.";
		}else{
			return undefined;
		}
	}

	var p = parseInt(data,10);
	if(_.isNaN(p)){
		throw "The value '" + data + "' in '" + field + "' should be a number.";
	}

	// Min Checking
	if(typeof(options.min)==='number' && p < options.min){
		throw "The number '" + data + "' in '" + field + "' must be greater than '" + options.min + "'.";
	}

	// Max Checking
	if(typeof(options.max)==='number' && p > options.max){
		throw "The number '" + data + "' in '" + field + "' must be less than '" + options.max + "'.";
	}

	// All good
	return p;
};

Utils.parseDateTime = function(datetime,field,options){
	options = options || {};
	if(_.isString(field))
	{
		var descriptor = "'" + field + "'";
	}else{
		var descriptor = "A date/time";
	}
	if(_.isUndefined(datetime))
	{
		// Date/time is empty
		if(options.required){
			throw descriptor + " is empty.";
		}else{
			return undefined;
		}
	}
	else if(_.isString(datetime))
	{
		// Field type is 'text'
		var parsedDatetime = moment(datetime);
		if(!parsedDatetime.isValid()){
			throw descriptor + " isn't in a recognised format ('" + datetime + "').";
		}
	}
	else if(_.isObject(datetime))
	{
		// Field type is 'datetime'
		if(!datetime.valid)
		{
			throw descriptor + " isn't in a recognised format ('" + datetime.input + "').";
		}
		else
		{
			var parsedDatetime = moment(datetime.parsed);
		}
	}

	if(options.format){
		return parsedDatetime.format(options.format);
	}else{
		return parsedDatetime.toISOString();
	}
};

module.exports = Utils;