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
    watch:{
      js:{
        options:{
          spawn: true,
          interrupt: true,
          debounceDelay: 250
        },
        files: ['lib/**/*.js','tests/**/*.spec.js'],
        tasks: ['test']
      }
    }
  });

  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('default',['test','watch']);
};
