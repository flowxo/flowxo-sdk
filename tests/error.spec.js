'use strict';
var sdk = require('../');

describe('FlowXO SDK Errors', function() {
  describe('ServiceError', function() {
    it('should accept a message as param', function() {
      var err = new sdk.Error.ServiceError('test');
      err.message.should.equal('test');
      err.name.should.equal('Error');
    });
  });
});
