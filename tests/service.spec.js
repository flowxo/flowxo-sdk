'use strict';
var sdk = require('../');

describe('FlowXO SDK Service', function() {
  var service;
  beforeEach(function() {
    service = new sdk.Service({
      name: 'testname',
      slug: 'testslug',
      auth: {
        type: 'oauth',
        authProvider: function() {}
      },
      methods: [{
        name: 'Add Test',
        slug: 'add_test',
        scripts: {
          run: function(options, cb) {
            // Echo back the options, for testing
            cb(null, options);
          }
        }

      }],
      scripts: {
        ping: function(options, cb) {
          cb(null, options);
        }
      }
    });
  });

  describe('#new', function() {
    it('should create a service with the correct values', function() {
      var json = service.toJSON();
      expect(json).to.be.an('object');
      expect(json.name).to.equal('testname');
      expect(json.slug).to.equal('testslug');
      expect(json.methods).to.be.an('array');
    });
  });

  describe('#runMethodScript', function() {
    it('should throw error when method is not defined', function(done) {
      service.runMethodScript('notamethod', 'run', {}, function(err, result) {
        expect(err).to.exist;
        expect(result).to.not.exist;
        done();
      });
    });

    it('should throw an error when a script of a method is not defined', function(done) {
      service.runMethodScript('add_test', 'notascript', {}, function(err, result) {
        expect(err).to.exist;
        expect(result).to.not.exist;
        done();
      });
    });

    it('should run a method successfully', function(done) {
      service.runMethodScript('add_test', 'run', {
        test: 1
      }, function(err, result) {
        // The method should have echoed back the input
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result).to.be.an('object');
        expect(result).to.have.property('test', 1);
        done();
      });
    });
  });

  describe('#runServiceScript', function() {
    it('should throw error when script is not defined', function(done) {
      service.runServiceScript('notascript', {}, function(err, result) {
        expect(err).to.exist;
        expect(result).to.not.exist;
        done();
      });
    });

    it('should run a service script successfully', function(done) {
      service.runServiceScript('ping', {
        ping: true
      }, function(err, result) {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result).to.have.property('ping', true);
        done();
      });
    });
  });

  describe('#registerMethod', function() {
    it('should add a method to the service', function() {
      expect(service.methods.length).to.equal(1);
      service.methods.length.should.equal(1);
      service.registerMethod({
        name: 'newmethod'
      });
      expect(service.methods.length).to.equal(2);
    });
  });

  describe('#runScript', function() {
    it('should throw an error with <2 or >5 arguments', function(done) {
      done();
    });
  });

  describe('#toJSON', function() {
    it('should return all required fields', function() {});
  });

  describe('#getMethod', function() {
    it('should return method config', function() {
      var method = service.getMethod('add_test');
      expect(method).to.exist;
      expect(method).to.be.an('object');
      expect(method).to.have.property('slug', 'add_test');
    });

    it('should return undefined if no such method', function() {
      expect(service.getMethod('not_a_method')).to.not.exist;
    });
  });

});
