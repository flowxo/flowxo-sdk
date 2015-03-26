'use strict';
var sdk = require('../');

describe('FlowXO SDK Service',function(){
	var service;
	beforeEach(function(){
		service = new sdk.Service({
			name: 'testname',
			slug: 'testslug',
			auth:{
				type: 'oauth',
				authProvider: function(){}
			},
			methods: [
				{
					name: 'Add Test',
					slug: 'add_test',
					scripts:{
						run: function(options,cb){
							// Echo back the options, for testing
							cb(null,options);
						}
					}

				}
			]
		});
	});

	describe('#new',function(){
		it('should create a service with the correct values',function(){
			var json = service.toJSON();
			json.should.be.a('object');
			json.name.should.equal('testname');
			json.slug.should.equal('testslug');
			json.methods.should.be.a('array');
		});
	});

	describe('#runMethodScript',function(){
		it('should throw error when method is not defined',function(done){
			service.runMethodScript('notamethod','run',{},function(err,result){
				err.should.exist();
				should.not.exist(result);
				done();
			});
		});

		it('should throw an error when a script of a method is not defined',function(done){
			service.runMethodScript('add_test','notascript',{},function(err,result){
				err.should.exist();
				should.not.exist(result);
				done();
			});
		});

		it('should run a method successfully',function(done){
			service.runMethodScript('add_test','run',{test:1},function(err,result){
				// The method should have echoed back the input
				should.not.exist(err);
				result.should.exist();
				result.should.be.a('object');
				result.test.should.equal(1);
				done();
			});
		});
	});

	describe('#registerMethod',function(){
		it('should add a method to the service',function(){
			service.methods.length.should.equal(1);
			service.registerMethod({
				name: 'newmethod'
			});
			service.methods.length.should.equal(2);
		});
	});

});