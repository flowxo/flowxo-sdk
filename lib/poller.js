'use strict';

var _ = require('lodash');

module.exports = function Poller(store) {
  var storeKey = '__pollids__';

  return {
    filterNewData: function(data, key, callback) {
      if(arguments.length === 2) {
        callback = key;
        key = 'id';
      }

      var cache_size = 1000;

      // Index our data
      var dataIndexed = _.keyBy(data, key);
      var dataKeys = Object.keys(dataIndexed);

      store.get(storeKey, function(err, cache) {
        if(!_.isArray(cache)) {
          return store.set(storeKey, dataKeys, function(err) {
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
        store.set(storeKey, cache, function(storeErr) {
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
    },

    setCache: function(data, cb) {
      store.set(storeKey, data, cb);
    }
  };
};
