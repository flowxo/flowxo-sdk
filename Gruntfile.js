'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    mocha_istanbul: {
      coverage: {
        src: ['tests/specs/**/*.spec.js'],
        options: {
          mask: '*.spec.js',
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false,
          require: ['./tests/helpers/chai']
        }
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage/**',
          check: {
            lines: 80,
            statements: 80,
            branches: 80,
            functions: 80
          }
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['Gruntfile.js', 'index.js', 'lib/**/*.js']
      },
      tests: {
        src: ['tests/**/*.spec.js'],
      }
    },
    watch: {
      js: {
        options: {
          spawn: true,
          interrupt: true,
          debounceDelay: 250
        },
        files: ['index.js', 'lib/**/*.js', 'tests/**/*.spec.js'],
        tasks: ['jshint', 'test']
      }
    }
  });

  grunt.registerTask('test', function(target) {
    var tasks = ['mocha_istanbul'];
    if(target === 'coverage') {
      tasks.push('istanbul_check_coverage');
    }
    grunt.task.run(tasks);
  });
  grunt.registerTask('default', ['test', 'watch']);
};
