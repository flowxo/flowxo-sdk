'use strict';

var RunUtil = require('../tasks/lib/run.js');

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
});
