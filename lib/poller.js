'use strict';
var _ = require('lodash');

module.exports = function Poller(store) {
  return function polling(data, key, callback) {

    if(arguments.length === 2) {
      callback = key;
      key = 'id';
    }

    var k = '__pollids__';
    var cache_size = 1000;

    // Index our data
    var dataIndexed = _.indexBy(data, key);
    var dataKeys = Object.keys(dataIndexed);

    store.get(k, function(err, cache) {
      if(!_.isArray(cache)) {
        return store.set(k, dataKeys, function(err) {
          callback(err, []);
        });
      }

      // Diff against the cache;
      var diff = _.difference(dataKeys, cache);

      // If nothing, return immediately
      if(diff.length === 0) {
        return callback(null, []);
      }

      // Circulate our cache
      if(Array.prototype.unshift.apply(cache, diff) > cache_size) {
        cache.length = cache_size;
      }

      // Store our cache before returning
      store.set(k, cache, function(storeErr) {
        if(storeErr) {
          return callback(storeErr);
        } else {
          diff = diff.map(function(d) {
            return dataIndexed[d];
          });

          callback(null, diff);
        }
      });

    });
  };
};
