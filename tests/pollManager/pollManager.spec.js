var assert = require('assert');
var sdk = require('../../');
var PollManager = sdk.PollManager;

describe('PollManager',function(){
  var store;
  beforeEach(function(){
    store = new sdk.MockScriptStore();
  });

  describe('#run()',function(){
    it('should run',function(){
      var p = new PollManager(store,{
        get: function(){
          return [{a: 1, b: 2}];
        },
	filter: function(data){
	  return data;
	},
        index: 'a'
      });
      p.run().then(function(newData){
	console.log("HERE",newData);
      });
    });
  });
}); 
