var    Q = require('q'),
  logger = require('winston'),
  moment = require('moment'),
       _ = require('lodash');

/**
 * PollManager
 *
 * options
 * - get    - a function that returns the latest dataset - must return an array
   - index  - a function to index the data, or a string to pass to _.indexBy
   - build  - a function that will build new objects ready for output
   - filter - a function that will filter the dataset returned from the API
   - page   - a function that manages paging through results
 */
function PollManager(store,options){
  this.store = store;

  // Cache Size
  this.cache_size = options.cache_size || 100;

  // Set they key where we will store our results in the scriptstore
  this.key = options.key || 'ids';

  // Defensively create a logger, in case we forgot to pass one in.
  this.logger = options.logger || {
    debug: function() {},
    info: function() {},
    warn: function() {}
  };

  // Indexer is either a function, or a string that is passed into _.indexBy to
  // index the data - must return an object.
  this.indexer = _.isFunction(options.index) ? options.index : function(data){
    return _.indexBy(data,options.index || 'id');
  };

  // By default do nothing
  this.builder = _.isFunction(options.build) ? options.build : Q;
  this.filter  = _.isFunction(options.filter) ? options.filter : Q;
  this.pager  = _.isFunction(options.pager) ? options.pager : Q;
  this.get = options.get;

  this.time = new Date();
}

/*
 * What do we need to do...
 * - Call get() to get some data
 * - Pass this data to filter() to remove unwanted data
 * - Pass the filtered data to indexer() to index the data
 * - Pass the filtered data to builder() to build the data
 * - Do something with paging
 * - Pass all the data back to the core
 */
PollManager.prototype.run = function(done){
  // var self = this;
  // return Q.try(this.get)
  // .then(function(data){
  //   return Q.try(self.filter,data);
  // })
  // .then(function(data){
  //   return Q.try(self.indexer,data)
  // })
  // .then(function(data){
  //   return Q.all(data.map(self.builder));
  // })
  // .then(self.pager)
  // .catch(function(err){
  //   console.log("ERR",err);
  // });
  var self = this;
  self.get(function(err,data){
    done(err,data);
  });
};

module.exports = PollManager;
