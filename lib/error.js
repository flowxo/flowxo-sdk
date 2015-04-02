'use strict';

var _ = require('lodash');
var util = require('util');

/**
 * BaseError
 *
 * Base class for all error classes
 */
function BaseError(message,err){
	this.message = message;
	this.err = err;
}
util.inherits(BaseError,Error);

var FXOError = {};
/**
 * ServiceError
 */
FXOError.ServiceError = function ServiceError(message,err){
	this.__fxotype__ = 'ServiceError';
	BaseError.call(this,message,err);
};
util.inherits(FXOError.ServiceError,BaseError);

/**
 * AuthServiceError
 */
FXOError.AuthError = function AuthError(message,err){
	this.__fxotype__ = 'AuthError';
	BaseError.call(this,message,err);
};
util.inherits(FXOError.AuthError, BaseError);

module.exports = FXOError;
