var Service = require('./lib/service');
var ScriptRunner = require('./lib/scriptRunner');
var MockScriptStore = require('./lib/mockScriptStore');
var Util = require('./lib/util');
var FXOError = require('./lib/error');
var Chai = require('./lib/chai');

// Ensure the Date object has superpowers
require('flowxo-utils').activateDateParser();

module.exports = {
  Service: Service,
  ScriptRunner: ScriptRunner,
  MockScriptStore: MockScriptStore,
  Util: Util,
  Error: FXOError,
  AuthError: FXOError.AuthError,
  ServiceError: FXOError.ServiceError,
  Chai: Chai
};
