'use strict';
// var validations = require('./validations');
var Service = require('./service');
var lodash = require('lodash');

module.exports = function(chai,_){

  var Assertion = chai.Assertion,
           flag = _.flag;

  /**
   * Syntax Sugar for flowxo e.g.
   * expect(service).to.be.flowxo.service;
   */
  Assertion.addProperty('flowxo',function(){
    return this;
  });

  Assertion.addProperty('script',function(){
      flag(this,'script',true);
  });

  Assertion.addProperty('poller',function(){
      flag(this,'poller',true);
  });
  /**
   * Set the expected type e.g.
   * expect(input).to.be.flowxo.input.field
   */
  Assertion.addProperty('input',function(){
    flag(this,'direction','input');
  });

  function validateScriptOutputItem(item){
    new Assertion(item).an('object');
  }

  Assertion.addProperty('output',function(){
    var script = flag(this,'script');
    if(script){
      var obj = flag(this,'object');
      var poller = flag(this,'poller');

      // If poller, we should have an array of valid items
      if(poller){
        new Assertion(obj).an('array');
        obj.map(validateScriptOutputItem);
      }else{
        validateScriptOutputItem(obj);
      }
    }else{
      flag(this,'direction','output');
    }
  });

  /**
   * Assert a method
   * expect(method).to.be.flowxo.method;
   */
  Assertion.addProperty('method',function(){
    var method = this._obj;
    new Assertion(method).to.have.property('name').a('string');
    new Assertion(method).to.have.property('slug').a('string');
    new Assertion(method).to.have.property('type').a('string').match(/^poller|webhook|action$/);
    new Assertion(method).to.have.property('kind').a('string').match(/^trigger|task$/);
    new Assertion(method).to.have.property('fields').a('object');

    for(var s in method.scripts){
      new Assertion(method.scripts[s]).to.be.a('function');
    }

    // If we have input fields
    if(method.fields.input){
      new Assertion(method.fields.input).to.be.an('array');
      method.fields.input.forEach(function(i){
        new Assertion(i).to.be.flowxo.input.field;
      });
    }

    // ... and output fields ...
    if(method.fields.output){
      new Assertion(method.fields.output).to.be.an('array');
      method.fields.output.forEach(function(o){
        new Assertion(o).to.be.flowxo.output.field;
      });
    }

  });

  /**
   * Assert a Flowxo Script
   * expect(script).to.be.flowxo.script;
   */
  // Assertion.addProperty('script',function(){
  //   var script = this._obj;
  //   new Assertion(script).to.be.a('function');
  // });

  Assertion.addProperty('field',function(){
    var type = flag(this,'direction');
    var obj = flag(this,'object');

    new Assertion(obj).to.be.an('object');

    if(type === 'output'){
      new Assertion(obj).to.have.property('key');
      new Assertion(obj).to.have.property('label');
    }else{
      new Assertion(obj).to.have.property('key');
      new Assertion(obj).to.have.property('type');
    }
  });

  // Overwrite `ok` to validate services if required
  Assertion.addProperty('service',function(){
    var obj = this._obj;

    // Type Check
    new Assertion(obj).to.be.instanceOf(Service);

    // Basic field checks
    new Assertion(obj).to.have.property('name').a('string');
    new Assertion(obj).to.have.property('slug').a('string');

    new Assertion(obj.methods).to.be.an('array');

    // Validate each method
    obj.methods.forEach(function(method){
      new Assertion(method).to.be.method;
    });
  });

  Assertion.addMethod('matchConfig',function(config){
    var self = this;
    var obj = flag(this,'object');
    var poller = config.type === 'poller';
    var outputConfig = config.fields.output;

    // Create an array of the keys defined in the outputConfig
    var outputConfigKeys = lodash.pluck(outputConfig,'key');

    function assertOutput(outputItem){
      // Go through each actual key
      Object.keys(outputItem).forEach(function(k){
        self.assert(
          outputConfigKeys.indexOf(k) !== -1,
          'output defined unexpected field #{exp} #{this}',
          'output defined expected field #{exp}',
          k
        );
      });

      outputConfigKeys.forEach(function(k){
        self.assert(
          outputItem.hasOwnProperty(k),
          'output failed to define expected field #{exp}',
          'output unexpectedly defined field #{exp}',
          k
        );
      });
    }

    if(poller){
      new Assertion(obj).to.be.an('array');
      obj.map(assertOutput);
    }else{
      assertOutput(obj);
    }
  });

};
