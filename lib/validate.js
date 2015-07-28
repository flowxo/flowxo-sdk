'use strict';

var validate = require('validate.js');

var validateFxoObject = function(type, value, options) {
  if(options.required) {
    if(!value) {
      return options.message || 'is required';
    }
  }

  if(value && !value.valid) {
    return options.message || 'is not a valid ' + type + ' input';
  }
};

validate.validators.fxoDatetime = function(value, options) {
  return validateFxoObject('datetime', value, options);
};

validate.validators.fxoBoolean = function(value, options) {
  return validateFxoObject('boolean', value, options);
};

validate.options = validate.async.options = {
  format: 'flat',
  fullMessages: true
};

module.exports = validate;
