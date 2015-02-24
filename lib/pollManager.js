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
function PollManager(service,store,options){
  this.service = service;
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
  this.indexer = Q.nbind(_.isFunction(options.index) ? options.index : function(data,cb){
    return cb(null,_.indexBy(data,options.index || 'id'));
  },this);

  // Filter is either a function, or an object that gets passed into _.filter
  this.filter = Q.nbind(_.isFunction(options.filter) ? options.filter : function(data,cb){
    return cb(null,_.filter(data,options.filter || {}));
  },this);

  // By default do nothing
  this.builder = _.isFunction(options.build) ? Q.nbind(options.build,this) : Q;
  this.pager  = _.isFunction(options.pager) ? Q.nbind(options.pager,this) : Q;
  this.diff = _.isFunction(options.diff) ? Q.nbind(options.diff,this) : Q.nbind(this.diff,this);

  this.get = Q.nbind(options.get,this);

  this.time = new Date();
}

/*
 * What do we need to do...
 * - Call get() to get some data
 * - Pass this data to filter() to remove unwanted data
 * - Pass the filtered data to indexer() to index the data
 * - Pass the filtered data to builder() to build the data
 * - Pass all the data back to the core
 */
PollManager.prototype.run = function(done){
  var self = this;
  // Load our cache
  var cachePromise = Q.nsend(this.store,'get',this.key);
  cachePromise.then(function(data){
    self.cache = data;
  })
  .then(this.get)
  .then(this.filter)
  .then(this.indexer)
  .then(this.diff)
  .then(this.builder)
  .nodeify(done);
};

PollManager.prototype.diff = function(data,cb){
  var self = this;
  var keys = Object.keys(data);

  if(this.cache === null){
    self.debug('initializing store with data.');
    return self.store.set(this.key,keys,cb);
  }

  var diff = _.difference(keys,this.cache);

  if(diff.length===0){
    self.debug('no new data');
    cb(null,[]);
  }

  // Circulate the cache
  if(Array.prototype.unshift.apply(self.cache,diff) > self.cache_size){
    self.debug('cycling cache');
    self.cache.length = self.cache_size;
  }

  self.store.set(self.key,self.cache,function(err){
    if(err) return cb(err);
    return cb(null,diff.map(function(k){
      return data[k]
    }));
  });
};

PollManager.prototype.debug = function(msg){
  return this.logger.debug('PollManager:',msg);
}


module.exports = PollManager;
