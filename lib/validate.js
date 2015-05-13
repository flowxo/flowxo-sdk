'use strict';

var validate = require('validate.js');

var validateFxoObject = function(type, value, key, options) {
  if(options.required) {
    if(!value) {
      return ' is required';
    }
  }

  if(value && !value.valid) {
    return 'is not a valid ' + type + ' input';
  }
};

validate.validators.fxoDatetime = function(value, key, options) {
  return validateFxoObject('datetime', value, key, options);
};

validate.validators.fxoBoolean = function(value, key, options) {
  return validateFxoObject('boolean', value, key, options);
};

validate.options = validate.async.options = {
  format: 'flat',
  fullMessages: true
};

module.exports = validate;
