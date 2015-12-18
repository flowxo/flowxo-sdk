'use strict';

var path = require('path');
var sdk = require('../../..');
var chai = require('chai');

chai.use(require('../../../lib/assertions'));

describe('Assertions', function() {
  describe('Field Validation', function() {
    var field, fn;
    beforeEach(function() {
      field = {
        key: 'key',
        type: 'text',
        required: true,
        label: 'Label'
      };
    });

    it('should validate input fields', function() {
      expect(field).to.be.input.field;
    });

    it('should detect missing input field properties', function() {
      fn = function() {
        expect({
          key: 'key'
        }).to.be.input.field;
      };

      expect(fn).to.throw('to have a property \'label\'');
    });

    describe('Select Field: Input Options', function() {
      beforeEach(function() {
        field.type = 'select';
        field.input_options = [{
          label: 'Foo',
          value: 'foo'
        }];
      });

      it('should ensure an input option is an object', function() {
        fn = function() {
          field.input_options[0] = 'string';
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option should be an object');
      });

      it('should ensure an input option has a label', function() {
        fn = function() {
          delete field.input_options[0].label;
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option needs a label');
      });

      it('should ensure an input option has a non-empty string label', function() {
        fn = function() {
          field.input_options[0].label = '';
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option label should be a non-empty string');
      });

      it('should ensure an input option has a value', function() {
        fn = function() {
          delete field.input_options[0].value;
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option needs a value');
      });

      it('should ensure an input option value is not undefined', function() {
        fn = function() {
          field.input_options[0].value = undefined;
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option value should be a number, boolean or non-empty string');
      });

      it('should ensure an input option value is not null', function() {
        fn = function() {
          field.input_options[0].value = null;
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option value should be a number, boolean or non-empty string');
      });

      it('should ensure an input option value is not an empty string', function() {
        fn = function() {
          field.input_options[0].value = '';
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option value should be a number, boolean or non-empty string');
      });

      it('should ensure an input option value is not an array', function() {
        fn = function() {
          field.input_options[0].value = [];
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option value should be a number, boolean or non-empty string');
      });

      it('should ensure an input option value is not an object', function() {
        fn = function() {
          field.input_options[0].value = {};
          expect(field).to.be.input.field;
        };
        expect(fn).to.throw('Input option value should be a number, boolean or non-empty string');
      });
    });
  });

  describe('Service Validation', function() {
    var service;
    beforeEach(function() {
      service = new sdk.Service({
        serviceRoot: path.resolve(__dirname + '../../../fixtures/test_service'),
        name: 'testname',
        slug: 'testslug',
        auth: {
          type: 'oauth1',
        },
        methods: ['dummy_method_1'],
        scripts: {
          ping: function(options, cb) {
            cb(null, options);
          }
        }
      });
    });

    it('should validate configuration', function() {

      expect(service).to.be.a.flowxo.service;

      expect(service.methods[0]).to.be.a.flowxo.method;
      expect(service.methods[0].fields).to.be.flowxo.fields;

      expect(service.methods[0].fields.input).to.be.flowxo.input.fields;
      expect(service.methods[0].fields.input[0]).to.be.flowxo.input.field;

      expect(service.methods[0].fields.output).to.be.flowxo.output.fields;
      expect(service.methods[0].fields.output[0]).to.be.flowxo.output.field;

      // Match output to configuration
      var output = {
        output: 1
      };
      expect(output).to.be.script.output;
      expect(output).to.matchConfig(service.methods[0]);

    });

    it('should allow no service auth', function() {
      delete service.auth;
      expect(service).to.be.a.flowxo.service;
    });

    it('should validate output', function() {
      var input = [{
        key: 'bob',
        type: 'datetime',
        label: 'Test'
      }];
      var output = [{
        key: 'bob',
        label: 'test'
      }];

      expect(output).to.be.flowxo.output;
      expect(input).to.be.flowxo.input;
      expect(input[0]).to.be.flowxo.input.field;
      expect(output[0]).to.be.flowxo.output.field;

      expect(function(){
        expect({key: 'bob'}).to.be.flowxo.output.field;
      }).to.throw('to have a property \'label\'');

      expect(function(){
        expect({key: 'bob', label: undefined}).to.be.flowxo.output.field;
      }).to.throw('expected undefined to be truthy');

      expect(function(){
        expect({key: undefined, label: 'test'}).to.be.flowxo.output.field;
      }).to.throw('expected undefined to be truthy');

      expect(function(){
        expect({key: null, label: 'test'}).to.be.flowxo.output.field;
      }).to.throw('expected null to be truthy');
    });

    it('should validate authentication type',function(){
      expect({type: 'oauth2'}).to.be.flowxo.auth;
      expect({type: 'oauth1'}).to.be.flowxo.auth;
      expect({type: 'credentials', fields: []}).to.be.flowxo.auth;
      expect(function(){
        expect({type: 'notauth'}).to.be.flowxo.auth;
      }).to.throw('Must have valid auth type');
    });

    it('should validate dependants', function() {
      var input = [{
        key: 'bob',
        type: 'datetime',
        label: 'Test',
        dependants: true
      }, {
        key: 'rob',
        type: 'select',
        label: 'Test',
        dependants: true,
        input_options: []
      }, {
        key: 'ron',
        type: 'datetime',
        label: 'Test',
        dependants: false
      }, {
        key: 'renne',
        type: 'select',
        label: 'Test',
        dependants: false,
        input_options: []
      }];
      expect(input).to.be.flowxo.input;
      expect(function() {
        expect(input[0]).to.be.flowxo.input.field;
      }).to.throw('Only \'select\' fields are allowed to have dependants');
      expect(function() {
        expect(input).to.be.flowxo.input.fields;
      }).to.throw('Only \'select\' fields are allowed to have dependants');
      expect(input[1]).to.be.flowxo.input.field;
      expect(input[2]).to.be.flowxo.input.field;
      expect(input[3]).to.be.flowxo.input.field;
    });

  });
});
