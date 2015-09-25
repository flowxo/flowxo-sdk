'use strict';

// Ensure the Date object has superpowers
require('flowxo-utils').activateDateParser();

module.exports = {
  Service: require('./lib/service'),
  Error: require('./lib/error')
};
