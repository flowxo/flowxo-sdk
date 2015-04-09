'use strict';
var sdk = require('../');
var chai = require('chai');

chai.use(require('../lib/chai'));

describe('Assertions',function(){
  describe('Field Validation',function(){
    var field, fn;
    beforeEach(function(){
      field = {
        key: 'key',
        type: 'text',
        required: true,
        label: 'Label'
      };
    });

    it('should validate input fields',function(){
      expect(field).to.be.input.field;
    });

    it('should detect missing input field properties',function(){
      fn = function(){
        expect({key: 'key'}).to.be.input.field;
      };

      expect(fn).to.throw('to have a property \'label\'');
    });

  });

  describe('Service Validation',function(){
    var service;
    beforeEach(function(){
      service = new sdk.Service({
        name: 'testname',
        slug: 'testslug',
        auth:{
          type: 'oauth1',
        },
        methods: [
          {
            name: 'Add Test',
            slug: 'add_test',
            type: 'action',
            kind: 'task',
            scripts:{
              run: function(options,cb){
                // Echo back the options, for testing
                cb(null,options);
              }
            },
            fields:{
              input: [{
                key: 'test',
                type: 'select',
                label: 'Test',
                input_options: []
              }],
              output: [{
                key: 'output', label: 'Output'
              }]
            }

          }
        ],
        scripts:{
          ping: function(options,cb){
            cb(null,options);
          }
        }
      });
    });

    it('should validate configuration',function(){

      expect(service).to.be.a.flowxo.service;

      expect(service.methods[0]).to.be.a.flowxo.method;
      expect(service.methods[0].fields).to.be.flowxo.fields;

      expect(service.methods[0].fields.input).to.be.flowxo.input.fields;
      expect(service.methods[0].fields.input[0]).to.be.flowxo.input.field;

      expect(service.methods[0].fields.output).to.be.flowxo.output.fields;
      expect(service.methods[0].fields.output[0]).to.be.flowxo.output.field;

      // Match output to configuration
      var output = { output: 1 };
      expect(output).to.be.script.output;
      expect(output).to.matchConfig(service.methods[0]);

    });

    it('should validate output',function(){
      var input = [{key: 'bob',type: 'datetime',label:'Test'}];
      var output = [{key: 'bob',label: 'test'}];

      expect(output).to.be.flowxo.output;
      expect(input).to.be.flowxo.input;
      expect(input[0]).to.be.flowxo.input.field;
      expect(output[0]).to.be.flowxo.output.field;
    });

  });
});

