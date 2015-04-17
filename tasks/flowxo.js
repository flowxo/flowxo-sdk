'use strict';

var AuthUtil = require('./lib/auth'),
    RunUtil = require('./lib/run');

module.exports = function(grunt) {
  grunt.registerMultiTask('flowxo', 'Flow XO auth and runner', function() {
    var options = this.options();

    switch(this.target) {
      case 'auth':
        AuthUtil.runTask.call(this, grunt, options);
        break;

      case 'run':
        RunUtil.runTask.call(this, grunt, options);
        break;

      default:
        break;
    }
  });
};
