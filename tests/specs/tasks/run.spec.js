'use strict';

var sdk = require('../../../');

var RunUtil = require('../../../tasks/lib/run.js');

describe('RunUtil', function() {
  describe('#formatScriptOutput', function() {

    var outputs = [{
      key: 'key1',
      label: 'Key 1',
    }, {
      key: 'key2',
      label: 'Key 2'
    }, {
      key: 'z_key',
      label: 'A key with Z at the start'
    }, {
      key: 'a_key',
      label: 'A Key with A at the start'
    }];

    it('should work set outputs keys that are not defined', function() {

      var data = {
        key1: 'Some Key 1 Data',
        z_key: 'Some more data'
      };

      var result = RunUtil.formatScriptOutput(outputs, data);
      expect(result).to.be.an('array').length(4);
      expect(result[0].value).to.equal(data.key1);
      expect(result[1].value).to.be.undefined;
      expect(result[2].value).to.equal(data.z_key);
      expect(result[3].value).to.undefined;
    });

    it('should preserve output field order', function() {
      var data = {
        key2: 'Some Key 2 Data',
        key1: 'Some Key 1 Data',
        a_key: 'More Data',
        z_key: 'blah'
      };

      var result = RunUtil.formatScriptOutput(outputs, data);
      expect(result[0].label).to.equal(outputs[0].label);
      expect(result[1].label).to.equal(outputs[1].label);
      expect(result[2].label).to.equal(outputs[2].label);
      expect(result[3].label).to.equal(outputs[3].label);
    });

    it('should handle nested data',function(){
      var nested_outputs = [{
        key: 'top',
        label: 'Top'
      },{
        key: 'nested__value',
        label: 'Nested Value'
      }];

      var nested_data = {
        top: 'Test Value',
        nested:{
          value: 'Nested Value'
        }
      };

      var result = RunUtil.formatScriptOutput(nested_outputs,nested_data);
      expect(result).to.be.an('array').length(2);
      expect(result[0].value).to.equal(nested_data.top);
      expect(result[1].value).to.equal(nested_data.nested.value);
    });
  });

  describe('#convertDictInputToObject', function() {
    it('should convert a single key-val pair', function() {
      var input = 'key=val';
      var obj = RunUtil.convertDictInputToObject(input);

      expect(obj).to.eql({
        key: 'val'
      });
    });

    it('should convert multiple key-val pairs', function() {
      var input = 'key1=val&key2=val';
      var obj = RunUtil.convertDictInputToObject(input);

      expect(obj).to.eql({
        key1: 'val',
        key2: 'val'
      });
    });

    it('should ignore escaped ampersands', function() {
      var input = 'key\\&1=va\\&l&key2=val';
      var obj = RunUtil.convertDictInputToObject(input);

      expect(obj).to.eql({
        'key\&1': 'va\&l',
        key2: 'val'
      });
    });

    it('should ignore escaped equals', function() {
      var input = 'key\\=1=va\\=l&key2=val';
      var obj = RunUtil.convertDictInputToObject(input);

      expect(obj).to.eql({
        'key\=1': 'va\=l',
        key2: 'val'
      });
    });

    it('should return an empty object if there are no key-val pairs', function() {
      ['', 'key', null, undefined]
        .forEach(function(input) {
          expect(RunUtil.convertDictInputToObject(input)).to.eql({});
      });
    });
  });

  describe('#processInput', function() {
    it('should process an input', function() {
      var input = {
        key: 'input',
        type: 'text'
      };
      var answers = {
        input: 'val'
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'text',
        value: 'val'
      });
      expect(processed).not.to.equal(input);
    });

    it('should assume an input without a type is a text input', function() {
      var input = {
        key: 'input'
      };
      var answers = {
        input: 'val'
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'text',
        value: 'val'
      });
      expect(processed).not.to.equal(input);
    });

    it('should process a text input with a single-quote empty string value', function() {
      var input = {
        key: 'input',
        type: 'text'
      };
      var answers = {
        input: '\'\''
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'text',
        value: ''
      });
      expect(processed).not.to.equal(input);
    });

    it('should process a text input with a double-quote empty string value', function() {
      var input = {
        key: 'input',
        type: 'text'
      };
      var answers = {
        input: '""'
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'text',
        value: ''
      });
      expect(processed).not.to.equal(input);
    });

    it('should process a textarea input with a single-quote empty string value', function() {
      var input = {
        key: 'input',
        type: 'textarea'
      };
      var answers = {
        input: '\'\''
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'textarea',
        value: ''
      });
      expect(processed).not.to.equal(input);
    });

    it('should process a textarea input with a double-quote empty string value', function() {
      var input = {
        key: 'input',
        type: 'textarea'
      };
      var answers = {
        input: '""'
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'textarea',
        value: ''
      });
      expect(processed).not.to.equal(input);
    });

    it('should process a dictionary input', function() {
      var input = {
        key: 'input',
        type: 'dictionary'
      };
      var answers = {
        input: 'key=val'
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'dictionary',
        value: {
          key: 'val'
        }
      });
      expect(processed).not.to.equal(input);
    });

    it('should return an object without a value if there was no answer for the input', function() {
      var input = {
        key: 'input',
        type: 'text'
      };
      var answers = {
        input: ''
      };

      var processed = RunUtil.processInput(input, answers);

      expect(processed).to.eql({
        key: 'input',
        type: 'text'
      });
      expect(processed).not.to.equal(input);
    });
  });

  describe('#getNormalizedErrorMessage', function() {
    it('should return a generic error message for retryable errors', function() {
      var err = new Error('test');
      var message = RunUtil.getNormalizedErrorMessage(err);

      message.should.eql('The request failed because something unexpected happened.');
    });

    it('should return a message for non-retryable errors', function() {
      var err = new sdk.Error.ServiceError('test');
      var message = RunUtil.getNormalizedErrorMessage(err);

      message.should.eql('test');
    });

    it('should return a fallback message for non-retryable errors if there is none', function() {
      var err = new sdk.Error.ServiceError();
      var message = RunUtil.getNormalizedErrorMessage(err);

      message.should.eql('There was an error with your task, please contact support.');
    });
  });
});
