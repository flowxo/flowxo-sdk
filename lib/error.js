'use strict';

var util = require('util');

function getStackWithoutMessage() {
  var stack = new Error().stack.split('\n'); // split into lines
  var firstIndex = 1;

  // Throw away lines containing this file's filename - they are unnecessary.
  // This is based on an assumption that the errors contained in this module
  // will not be thrown there.
  while(stack[firstIndex].indexOf(__filename) !== -1) {
    firstIndex += 1;
  }

  return stack.slice(firstIndex).join('\n');
}

/**
 * BaseError
 *
 * Base class for all error classes
 */
function BaseError(message, err) {
  if(!this || this.constructor === BaseError) {
    throw new TypeError('BaseError constructor should only be used within other error constructors');
  }

  Error.call(this);

  this.__fxotype__ = this.constructor.name; // This is used by the core
  this.message = message || '';

  if(err) {
    this.err = err;
  }

  // It's important that this is set up at the end, because it uses the
  // toString prototype method, which relies on the `message` property.

  // This method is more reliable than Error.captureStackTrace - the stack and
  // the message are more accurate.
  this.stack = this.toString() + '\n' + getStackWithoutMessage();
}
util.inherits(BaseError, Error);
exports.BaseError = BaseError;

BaseError.prototype.toString = function toString() {
  var str = this.__fxotype__;
  if(this.message) {
    str += ': ' + this.message;
  }

  return str;
};

BaseError.prototype.inspect = function inspect() {
  return '[' + this.toString() + ']';
};

/**
 * ServiceError
 */
function ServiceError(message, err) {
  if(!(this instanceof ServiceError)) {
    return new ServiceError(message, err);
  }
  BaseError.call(this, message, err);
}
util.inherits(ServiceError, BaseError);
exports.ServiceError = ServiceError;

/**
 * AuthError
 */
function AuthError(message, err) {
  if(!(this instanceof AuthError)) {
    return new AuthError(message, err);
  }
  BaseError.call(this, message, err);
}
util.inherits(AuthError, BaseError);
exports.AuthError = AuthError;

/**
 * WebhookIgnoreError
 */
function WebhookIgnoreError(message, err) {
  if(!(this instanceof WebhookIgnoreError)) {
    return new WebhookIgnoreError(message, err);
  }
  BaseError.call(this, message, err);
}
util.inherits(WebhookIgnoreError, BaseError);
exports.WebhookIgnoreError = WebhookIgnoreError;
