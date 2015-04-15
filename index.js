'use strict';

// Ensure the Date object has superpowers
require('flowxo-utils').activateDateParser();

module.exports = {
  // Public API
  Service: require('./lib/service'),
  Error: require('./lib/error'),

  // Private API
  ScriptRunner: require('./lib/scriptRunner'),
  Chai: require('./lib/chai')
};
