'use strict';

var _ = require('lodash');
var util = require('util');

/**
 * BaseError
 *
 * Base class for all error classes
 */
function BaseError(opt){
	if(typeof opt === 'string'){
		this.message = opt;
	}else{
		_.assign(this,opt);
	}
}
util.inherits(BaseError,Error);

var FXOError = {};
/**
 * ServiceError
 */
FXOError.ServiceError = function ServiceError(opt){
	this.__fxotype__ = 'ServiceError';
	BaseError.call(this,opt);
};
util.inherits(FXOError.ServiceError,BaseError);

/**
 * OAuthError
 */
FXOError.OAuthError = function OAuthError(opt){
	this.__fxotype__ = 'OAuthError';
	BaseError.call(this,opt);
};
util.inherits(FXOError.OAuthError, BaseError);

/**
 * RetryableError
 */
FXOError.RetryableError = function RetryableError(opt){
	this.__fxotype__ = 'RetryableError';
	BaseError.call(this,opt);
};
util.inherits(FXOError.RetryableError,BaseError);

module.exports = FXOError;