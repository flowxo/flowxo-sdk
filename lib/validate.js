'use strict';

var validate = require('validate.js');
var FxoUtils = require('flowxo-utils');

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

validate.extend(validate.validators.datetime, {
  // The value is guaranteed not to be null or undefined
  // but otherwise it could be anything.
  parse: function(value) {
    var d = FxoUtils.parseDateTimeField(value);
    return d.valid ? d.parsed.getTime() : NaN;
  },
  // Input is a unix timestamp
  format: function(value, options) {
    var format = options.dateOnly ?
      '{yyyy}-{MM}-{dd}' :
      '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}';

    var d = FxoUtils.parseDateTimeField(value);
    return d.parsed.format(format);
  }
});

validate.options = validate.async.options = {
  format: 'flat',
  fullMessages: true
};

module.exports = validate;
