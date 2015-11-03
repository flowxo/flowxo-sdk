'use strict';
// var validations = require('./validations');
var Service = require('./service');
var lodash = require('lodash');

module.exports = function(chai, _) {
  var Assertion = chai.Assertion,
    flag = _.flag;

  /**
   * Syntax Sugar for flowxo e.g.
   * expect(service).to.be.flowxo.service;
   */
  Assertion.addProperty('flowxo', function() {
    return this;
  });

  Assertion.addProperty('script', function() {
    flag(this, 'script', true);
  });

  Assertion.addProperty('poller', function() {
    flag(this, 'poller', true);
  });
  /**
   * Set the expected type e.g.
   * expect(input).to.be.flowxo.input.field
   */
  Assertion.addProperty('input', function() {
    flag(this, 'direction', 'input');
  });

  function validateScriptOutputItem(item) {
    new Assertion(item, 'script output should be an object').an('object');
  }

  Assertion.addProperty('output', function() {
    var script = flag(this, 'script');
    if(script) {
      var obj = flag(this, 'object');
      var poller = flag(this, 'poller');

      // If trigger, we should have an array of valid items
      if(poller) {
        new Assertion(obj).an('array');
        obj.map(validateScriptOutputItem);
      } else {
        validateScriptOutputItem(obj);
      }
    } else {
      flag(this, 'direction', 'output');
    }
  });

  Assertion.addProperty('slug', function() {
    var slug = this._obj;
    new Assertion(slug).to.be.a('string');
    new Assertion(slug).to.match(/^[a-z0-9-_]+$/);
  });

  /**
   * Assert a method
   * expect(method).to.be.flowxo.method;
   */
  Assertion.addProperty('method', function() {
    var method = this._obj;
    new Assertion(method).to.have.property('name').a('string');
    new Assertion(method).to.have.property('slug').a('string');
    new Assertion(method.slug).to.be.a.flowxo.slug;

    new Assertion(method).to.have.property('type').a('string').match(/^poller|webhook|action$/);
    new Assertion(method).to.have.property('kind').a('string').match(/^trigger|task$/);
    new Assertion(method).to.have.property('fields').an('object');
    new Assertion(method).to.have.property('scripts').an('object');

    new Assertion(method.scripts, 'method `scripts` object must define a run script').to.have.property('run').a('function');
    ['input', 'output'].forEach(function(s) {
      if(s in method.scripts) {
        new Assertion(method.scripts[s]).to.be.a('function');
      }
    });

    // If we have input fields
    if(method.fields.input) {
      new Assertion(method.fields.input).to.be.an('array');
      method.fields.input.forEach(function(i) {
        new Assertion(i).to.be.flowxo.input.field;
      });
    }

    // ... and output fields ...
    if(method.fields.output) {
      new Assertion(method.fields.output).to.be.an('array');
      method.fields.output.forEach(function(o) {
        new Assertion(o).to.be.flowxo.output.field;
      });
    }

    if(method.type === 'webhook') {
      new Assertion(method).to.have.property('help').an('object');
    }

  });

  Assertion.addProperty('field', function() {
    var type = flag(this, 'direction');
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('object');
    new Assertion(obj).to.have.property('key');
    new Assertion(obj).to.have.property('label');
    new Assertion(obj.key).to.be.ok;
    new Assertion(obj.label).to.be.ok;

    if(type === 'input') {
      new Assertion(obj).to.have.property('key').a('string');
      new Assertion(obj.key).to.be.ok;
      new Assertion(obj).to.have.property('type').a('string');
      new Assertion(obj.type).to.match(/^text|password|email|select|textarea|datetime|boolean|dictionary$/);
      new Assertion(obj).to.have.property('label').a('string');
      new Assertion(obj.label).to.be.ok;

      if(obj.type === 'select' || (obj.type === 'boolean' && obj.input_options)) {
        new Assertion(obj).to.have.property('input_options').an('array');
        obj.input_options.forEach(function(input_option) {
          new Assertion(input_option).to.be.an('object');
          new Assertion(input_option).to.have.property('label').a('string');
          new Assertion(input_option.label).to.be.ok;
          new Assertion(input_option).to.have.property('value');
          new Assertion(input_option.value).to.not.be.undefined;
          new Assertion(input_option.value).to.not.be.null;
          new Assertion(input_option.value).to.not.eql('');
          new Assertion(input_option.value).to.satisfy(function(val) {
            return lodash.isNumber(val) ||
                   lodash.isBoolean(val) ||
                   lodash.isString(val);
          }, 'Input option value should be a number, string or boolean');
        });
      }
      if(obj.dependants === true){
        new Assertion(obj).to.have.property('type');
        new Assertion(obj.type, 'Only \'select\' fields are allowed to have dependants').to.match(/^select$/);
      }
    }
  });

  Assertion.addProperty('fields', function() {
    var obj = flag(this, 'object');
    var direction = flag(this, 'direction');

    if(!direction) {
      new Assertion(obj).to.be.an('object');
      return;
    }

    var assertion = new Assertion(obj);
    assertion.to.be.an('array');

    obj.forEach(function(field) {
      var fieldAssertion = new Assertion(field);
      _.flag(fieldAssertion, 'direction', direction);
      fieldAssertion.to.be.a.flowxo.field;
    });
  });

  Assertion.addProperty('auth', function() {
    var obj = this._obj;

    new Assertion(obj).to.have.property('type').a('string');
    new Assertion(obj.type, 'Must have valid auth type').to.match(/^credentials|oauth1|oauth2$/);

    if(obj.type === 'credentials') {
      new Assertion(obj).to.have.property('fields').an('array');
      obj.fields.forEach(function(field) {
        new Assertion(field).to.be.a.flowxo.field;
      });
    }
  });

  Assertion.addProperty('service', function() {
    var obj = this._obj;

    // Type Check
    new Assertion(obj).to.be.instanceOf(Service);

    // Basic field checks
    new Assertion(obj).to.have.property('name').a('string');
    new Assertion(obj).to.have.property('slug').a('string');

    new Assertion(obj.methods).to.be.an('array');

    // Auth
    new Assertion(obj).to.have.property('auth').an('object');
    new Assertion(obj.auth).to.be.a.flowxo.auth;

    // Validate each method
    obj.methods.forEach(function(method) {
      new Assertion(method).to.be.method;
    });
  });

  Assertion.addMethod('matchConfig', function(config) {
    var self = this;
    var obj = flag(this, 'object');
    var poller = config.type === 'poller';
    var outputConfig = config.fields.output;

    // Create an array of the keys defined in the outputConfig
    var outputConfigKeys = lodash.pluck(outputConfig, 'key');

    function assertOutput(outputItem) {
      // Go through each actual key
      Object.keys(outputItem).forEach(function(k) {
        self.assert(
          outputConfigKeys.indexOf(k) !== -1,
          'result contains a field #{exp} that is not defined in the method\'s config #{this}',
          'result contains expected field #{exp}',
          k
        );
      });

      /*
       * Currently it is not required that scripts define
       * all their output fields on each run - if this
       * changes, uncomment this
      outputConfigKeys.forEach(function(k) {
        self.assert(
          outputItem.hasOwnProperty(k),
          'output failed to define expected field #{exp}',
          'output unexpectedly defined field #{exp}',
          k
        );
      });
      */
    }

    if(poller) {
      new Assertion(obj).to.be.an('array');
      obj.map(assertOutput);
    } else {
      assertOutput(obj);
    }
  });

};
