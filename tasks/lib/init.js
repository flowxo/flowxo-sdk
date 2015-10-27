'use strict';

// Used to load the modules devDependencies.

// Any required modules must be available
// at run-time when the SDK is used as part
// of a service. This means they need to be
// either node core modules, or included
// in the `dependencies` map in the SDK's
// `package.json`.
var spawn = require('cross-spawn-async');

var Init = {};

Init.runTask = function() {
  var done = this.async();

  console.log('Installing SDK dependencies...');

  spawn('npm', ['install'], {
    stdio: 'inherit',
    cwd: __dirname
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('exit', function(code) {
    done(!code);
  });
};

module.exports = Init;
