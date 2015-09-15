'use strict';

// Used to load the modules devDependencies.
// Be careful to only use the node core modules here,
// as by nature, the SDK's dependencies may not
// be available yet.

var spawn = require('child_process').spawn;

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
