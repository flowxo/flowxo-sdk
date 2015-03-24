'use strict';

module.exports = function(grunt){

  // Add the grunt-mocha-test tasks.
//  grunt.loadNpmTasks('grunt-mocha-test');

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);


  grunt.initConfig({
    mochaTest:{
      test:{
        options:{
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false,
          require: './tests/helpers/chai'
        },
        src: ['tests/**/*.spec.js']
      }
    },
    jshint:{
      options:{
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source:{
        src: ['Gruntfile.js','index.js','lib/**/*.js']
      },
      tests:{
        src: ['tests/**/*.spec.js'],
      }
    },
    watch:{
      js:{
        options:{
          spawn: true,
          interrupt: true,
          debounceDelay: 250
        },
        files: ['index.js','lib/**/*.js','tests/**/*.spec.js'],
        tasks: ['jshint','test']
      }
    }
  });

  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('default',['test','watch']);
};
