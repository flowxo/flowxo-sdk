'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('flowxo', 'Flow XO auth and runner', function() {
    var module = require('./lib/' + this.target);
    module.runTask.call(this, grunt, this.options());
  });
};
