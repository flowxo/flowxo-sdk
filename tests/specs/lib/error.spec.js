'use strict';
var sdk = require('../../../');

describe('FlowXO SDK Errors', function() {
  describe('BaseError', function() {
    it('should not allow instantiating BaseError objects', function() {
      expect(function() {
        new sdk.Error.BaseError();
      }).to.throw(TypeError);
    });

    it('should not allow invoking BaseError as a function', function() {
      expect(function() {
        var BaseError = sdk.Error.BaseError;
        BaseError();
      }).to.throw(TypeError);
    });
  });

  describe('ServiceError', function() {
    it('should accept a message as param', function() {
      var err = new sdk.Error.ServiceError('test');
      err.__fxotype__.should.equal('ServiceError');
      err.message.should.equal('test');
      err.name.should.equal('Error');
      expect(err).to.have.property('stack');
      expect(err).not.to.have.property(err);
    });

    it('should use an empty string when no message is provided', function() {
      var err = new sdk.Error.ServiceError();
      err.__fxotype__.should.equal('ServiceError');
      err.message.should.equal('');
      err.name.should.equal('Error');
      expect(err).to.have.property('stack');
      expect(err).not.to.have.property(err);
    });

    it('should accept an additional `err` param', function() {
      var innerError = new Error();
      var err = new sdk.Error.ServiceError('test', innerError);
      err.__fxotype__.should.equal('ServiceError');
      err.message.should.equal('test');
      err.name.should.equal('Error');
      err.err.should.equal(innerError);
      expect(err).to.have.property('stack');
    });

    it('should work as well when not created with `new`', function() {
      var err = sdk.Error.ServiceError('test');
      err.__fxotype__.should.equal('ServiceError');
      err.message.should.equal('test');
      err.name.should.equal('Error');
      expect(err).to.have.property('stack');
    });

    describe('#toString', function() {
      it('should return an error type and message if there is one', function() {
        var err = new sdk.Error.ServiceError('test');
        err.toString().should.equal('ServiceError: test');
      });

      it('should return only an error type if there is no message', function() {
        var err = new sdk.Error.ServiceError();
        err.toString().should.equal('ServiceError');
      });
    });
  });
});
