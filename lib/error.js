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
 * OAuthServiceError
 */
FXOError.OAuthServiceError = function OAuthServiceError(opt){
	this.__fxotype__ = 'OAuthServiceError';
	BaseError.call(this,opt);
};
util.inherits(FXOError.OAuthServiceError, BaseError);

/**
 * RetryableServiceError
 */
FXOError.RetryableServiceError = function RetryableServiceError(opt){
	this.__fxotype__ = 'RetryableServiceError';
	BaseError.call(this,opt);
};
util.inherits(FXOError.RetryableServiceError,BaseError);

module.exports = FXOError;