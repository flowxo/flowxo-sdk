var assert = require('assert');
var sdk = require('../../');
var ConfigUtils = sdk.ConfigUtils;

describe('ConfigUtils',function(){
  describe('#loadMethods()',function(){
    it('should return methods',function(){
      var methods = ConfigUtils.loadMethods(__dirname);
      methods.should.be.a('array');
    });
  });
}); 
var methods = ConfigUtils.loadMethods(__dirname);
