'use strict';

var path = require('path');

var sdk = require('../../../');
var testServiceRoot = path.resolve(__dirname + '../../../fixtures/test_service');

describe('FlowXO SDK Service', function() {
  var serviceConfig;
  beforeEach(function() {
    serviceConfig = {
      serviceRoot: testServiceRoot,
      name: 'Test Service',
      slug: 'test_service',
      auth: {
        type: 'oauth',
        authProvider: function() {}
      },
      scripts: {
        ping: function(options, cb) {
          cb(null, options);
        }
      },
      methods: []
    };
  });

  describe('constructor', function() {
    it('should create a service with the correct values', function() {
      var service = new sdk.Service(serviceConfig);

      expect(service.serviceRoot).to.equal(testServiceRoot);
      expect(service.name).to.eql('Test Service');
      expect(service.slug).to.eql('test_service');
      expect(service.auth).to.eql(serviceConfig.auth);
      expect(service.scripts).to.eql(serviceConfig.scripts);
      expect(service.methodDir).to.eql(testServiceRoot + '/methods');
      expect(service.methodOrder).to.eql([]);
      expect(service.methods).to.eql([]);
      expect(service.methodsIndexed).to.eql({});
    });

    it('should default scripts to an empty array', function() {
      delete serviceConfig.scripts;
      var service = new sdk.Service(serviceConfig);
      expect(service.scripts).to.eql([]);
    });

    it('should register methods in the defined order', function() {
      serviceConfig.methods = [
        'dummy_method_2',
        'dummy_method_1'
      ];

      var service = new sdk.Service(serviceConfig);

      expect(service.methods).to.be.an('array');
      expect(service.methods).to.have.length(2);
      expect(service.methods[0]).to.be.an('object');
      expect(service.methods[0].slug).to.equal('dummy_method_2');
      expect(service.methods[1]).to.be.an('object');
      expect(service.methods[1].slug).to.equal('dummy_method_1');
    });

    it('should register all methods automatically if none are defined', function() {
      delete serviceConfig.methods;

      var service = new sdk.Service(serviceConfig);

      // Method order will be undefined, but we should
      // still have both methods registered.
      expect(service.methods).to.be.an('array');
      expect(service.methods).to.have.length(2);
    });
  });

  describe('methods', function() {
    var service;
    beforeEach(function() {
      serviceConfig.methods = ['dummy_method_1'];
      service = new sdk.Service(serviceConfig);
    });

    describe('#registerMethod', function() {
      it('should add a method to the service', function() {
        expect(service.methods.length).to.equal(1);
        service.registerMethod({
          name: 'newmethod'
        });
        expect(service.methods.length).to.equal(2);
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
        service.runMethodScript('dummy_method_1', 'notascript', {}, function(err, result) {
          expect(err).to.exist;
          expect(result).to.not.exist;
          done();
        });
      });

      it('should run a method successfully', function(done) {
        service.runMethodScript('dummy_method_1', 'run', {
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

    describe('#getMethod', function() {
      it('should return method config', function() {
        var method = service.getMethod('dummy_method_1');
        expect(method).to.exist;
        expect(method).to.be.an('object');
        expect(method).to.have.property('slug', 'dummy_method_1');
      });

      it('should return undefined if no such method', function() {
        expect(service.getMethod('not_a_method')).to.not.exist;
      });
    });

  });

});
