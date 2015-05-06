'use strict';

require('./check-deps');

var util = require('util'),
  path = require('path'),
  inquirer = require('inquirer'),
  chalk = require('chalk'),
  async = require('async'),
  chai = require('chai'),
  FxoUtils = require('flowxo-utils'),
  SDK = require('../../index.js');

chai.use(SDK.Chai);

var CommonUtil = require('./common');

var RunUtil = {};

RunUtil.displayScriptData = function(grunt, data) {
  CommonUtil.header(grunt, 'DATA:', 'green');
  grunt.log.writeln(chalk.cyan(JSON.stringify(data, null, 2)));
};

/**
 * Processes the data returned from a script
 * into a format suitable for outputing
 * @param  {Array} outputs Flow XO Output Field objects
 * @param  {Object} data Data returned from script
 * @return {Array} Processed data - either an array of fields, or an
 * array of arrays if the incoming data
 */
RunUtil.formatScriptOutput = function(outputs, data) {

  // Flatten the output.
  var flattened = FxoUtils.getFlattenedFields(data);

  var flattenedIdx = flattened.reduce(function(result, field) {
    result[field.key] = field;
    return result;
  }, {});

  return outputs.reduce(function(result, output) {
    // Lookup the field from the data
    var field = flattenedIdx[output.key];
    result.push({
      label: output.label,
      value: field ? data[field.key] : undefined
    });
    return result;
  }, []);
};

RunUtil.displayScriptOutput = function(grunt, outputs, data) {

  var fieldIndent = '  ';
  var objIndent = '';
  var dataLabelled;

  function writeField(field, last) {
    var format = field.value === undefined ? chalk.gray : chalk.cyan;
    grunt.log.writeln(format(fieldIndent + JSON.stringify(field.label) + ': ' + JSON.stringify(field.value) + '' + (last ? '' : ',')));
  }

  function writeObject(obj, last) {
    if(obj.length === 0) {
      grunt.log.writeln(chalk.cyan(objIndent + '{}' + (last ? '' : ',')));
    } else {
      grunt.log.writeln(chalk.cyan(objIndent + '{'));
      for(var i = 0; i < obj.length; i++) {
        writeField(obj[i], i === obj.length - 1);
      }
      grunt.log.writeln(chalk.cyan(objIndent + '}' + (last ? '' : ',')));
    }
  }

  if(outputs.length) {

    CommonUtil.header(grunt, 'LABELLED:', 'green');

    // If this is an array
    if(util.isArray(data)) {
      if(data.length === 0) {
        grunt.log.writeln(chalk.cyan('[]'));

      } else {
        // Set the indents
        fieldIndent = '    ';
        objIndent = '  ';

        grunt.log.writeln(chalk.cyan('['));

        for(var i = 0; i < data.length; i++) {
          dataLabelled = RunUtil.formatScriptOutput(outputs, data[i]);
          writeObject(dataLabelled, i === data.length - 1);
        }

        grunt.log.writeln(chalk.cyan(']'));
      }

    } else {
      dataLabelled = RunUtil.formatScriptOutput(outputs, data);
      writeObject(dataLabelled, true);
    }
  }
};

RunUtil.promptScript = function(method, cb) {
  var prompts = [{
    type: 'list',
    name: 'script',
    message: 'Select a script',
    choices: Object.keys(method.scripts)
  }];

  inquirer.prompt(prompts, function(result) {
    cb(null, result.script);
  });
};

RunUtil.promptMethod = function(service, cb) {
  var prompts = [{
    type: 'list',
    name: 'method',
    message: 'Method',
    choices: service.methods.map(function(m) {
      return {
        name: m.name,
        value: m
      };
    })
  }];

  inquirer.prompt(prompts, function(result) {
    cb(null, result.method);
  });
};

RunUtil.validateService = function(grunt, service) {
  try {
    chai.expect(service).to.be.a.flowxo.service;
  } catch(e) {
    CommonUtil.header(grunt, 'SERVICE CONFIG VALIDATION FAILED', 'red');
    grunt.fail.fatal(e);
  }
};

RunUtil.checkRunScriptResult = function(result, method) {
  if(method.kind === 'trigger') {
    chai.expect(result).to.be.a.flowxo.trigger.script.output;
  } else {
    chai.expect(result).to.be.a.flowxo.script.output;
  }
};

RunUtil.getCredentials = function(grunt, credentialsPath) {
  return grunt.file.readJSON(credentialsPath);
};

RunUtil.getRunFile = function(grunt) {
  return(grunt.option('name') || 'runs') + '.json';
};

RunUtil.run = function(grunt, options, cb) {
  var runner = options.runner,
    service = options.service,
    method = options.method;

  // Firstly, validate the service.
  // If it is not configured correctly, end.
  RunUtil.validateService(grunt, service);

  var inputs = options.inputs || [],
    outputs = [];

  var inputsPredefined = inputs.length !== 0;

  var fieldPromptOptions = {
    validateRequired: false
  };

  function addInputIfDefined(field, answers, custom) {
    var ans = answers[field.key];

    /* jshint eqnull: true */
    if(ans != null && ans !== '') {
      var f = {
        key: field.key,
        type: field.type || 'text',
        value: answers[field.key],
        custom: custom === true,
        label: field.label
      };
      inputs.push(f);
    }
    /* jshint eqnull: false */
  }

  function addInputsIfDefined(fields, answers, custom) {
    fields.forEach(function(field) {
      addInputIfDefined(field, answers, custom);
    });
  }

  async.waterfall([
    // Method Selection
    function(callback) {
      if(typeof method !== 'undefined') {
        method = service.getMethod(method);
        CommonUtil.header(grunt, 'Method: ' + method.name);
        callback(null, method);
      } else {
        CommonUtil.header(grunt, 'Method Selection');
        RunUtil.promptMethod(service, callback);
      }
    },

    // Static Inputs
    function(method, callback) {
      if(method.fields.input && method.fields.input.length) {
        CommonUtil.header(grunt, 'Standard Input Fields');

        // If we've been given them, just set and move on
        if(inputsPredefined) {
          inputs.forEach(function(input) {
            if(!input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          return callback(null, method);
        }

        // Else prompt for them
        CommonUtil.promptFields(method.fields.input, fieldPromptOptions, function(err, answers) {
          if(err) {
            return callback(err);
          } else {
            addInputsIfDefined(method.fields.input, answers);
            callback(null, method);
          }
        });
      } else {
        callback(null, method);
      }
    },

    // input.js
    function(method, callback) {
      if(!method.scripts.input) {
        return callback(null, method);
      }
      CommonUtil.header(grunt, 'Custom Input Fields');
      runner.run(method.slug, 'input', function(err, customInputFields) {
        if(err) {
          return callback(err);
        }

        try {
          chai.expect(customInputFields).to.be.flowxo.input.fields;
        } catch(e) {
          grunt.fail.fatal('Error in return from input.js script: ' + e.toString());
        }

        // If we've been given some values, use those
        if(inputsPredefined) {
          inputs.forEach(function(input) {
            if(input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          return callback(null, method);
        }

        // Else prompt for some
        CommonUtil.promptFields(customInputFields, fieldPromptOptions, function(err, answers) {
          if(err) {
            callback(err);
          } else {
            addInputsIfDefined(customInputFields, answers, true);
            callback(null, method);
          }
        });
      });
    },

    // output.js
    function(method, callback) {
      if(method.fields.output) {
        outputs = outputs.concat(method.fields.output);
      }

      if(!method.scripts.output) {
        return callback(null, method);
      }
      runner.run(method.slug, 'output', {
        input: inputs
      }, function(err, customOutputs) {
        if(err) {
          callback(err);
        } else {
          try {
            chai.expect(customOutputs).to.be.flowxo.output.fields;
          } catch(e) {
            grunt.fail.fatal('Error in return from output.js script: ' + e.toString());
          }

          outputs = outputs.concat(customOutputs);
          callback(null, method);
        }
      });
    },

    // run.js
    function(method, callback) {
      runner.run(method.slug, 'run', {
        input: inputs
      }, function(err, result) {
        if(err) {
          callback(err);
        } else {
          callback(null, method, result);
        }
      });
    },

    // validation and output
    function(method, result, callback) {
      RunUtil.displayScriptData(grunt, result);
      RunUtil.displayScriptOutput(grunt, outputs, result);

      try {
        RunUtil.checkRunScriptResult(result, method);
      } catch(e) {
        CommonUtil.header(grunt, 'VALIDATION:', 'red');
        grunt.fail.fatal(e);
      }
      callback(null, method, result);
    }
  ], function(err, method, result) {
    if(err) {
      CommonUtil.header(grunt, 'Script Error', 'red');
      grunt.fail.fatal(err);
    }
    // Callback enough data so the caller can record
    // the run
    cb(err, result, method, inputs);
  });
};

RunUtil.runUntilStopped = function(grunt, options, cb) {
  function runIt() {
    RunUtil.run(grunt, options, function(err, result, method, inputs) {
      if(err) {
        return cb(err);
      }

      if(options.runCompleted) {
        options.runCompleted(result, method, inputs);
      }

      grunt.log.writeln();
      inquirer.prompt({
        type: 'confirm',
        name: 'again',
        message: 'Would you like to run another method?',
        default: true
      }, function(answers) {
        return answers.again ? runIt() : cb();
      });
    });
  }

  runIt();
};

RunUtil.runSingleScript = function(grunt, options, cb) {
  var runner = options.runner,
    service = options.service,
    method, script;

  // Firstly, validate the service.
  // If it is not configured correctly, end.
  RunUtil.validateService(grunt, service);

  var fieldPromptOptions = {
    validateRequired: false
  };

  async.waterfall([
    // Get a method
    RunUtil.promptMethod.bind(RunUtil, service),
    // Get a service script
    function(userMethod, callback) {
      method = userMethod;
      RunUtil.promptScript(method, callback);
    },
    // Get some fields
    function(userScript, callback) {
      // If it's a run script, do some inputs
      script = userScript;
      if(userScript === 'run' && method.fields.input) {
        RunUtil.promptFields(method.fields.input, fieldPromptOptions, callback);
      } else {
        callback(null, {});
      }
    },
    // Run the script
    function(inputs, callback) {
      runner.run(method.slug, script, {
        input: inputs
      }, function(err, result) {
        if(err) {
          callback(err);
        } else {
          callback(null, result);

        }
      });
    },
  ], function(err, result) {
    if(err) {
      grunt.fail.fatal(err);
    }

    RunUtil.displayScriptData(grunt, result);

    // Unless we have the --no-check-outputs option on
    if(!grunt.option('no-check-outputs')) {
      if(script === 'run') {
        RunUtil.checkRunScriptResult(result, method);
      } else if(script === 'input') {
        chai.expect(result).to.be.flowxo.input.fields;
      } else if(script === 'output') {
        chai.expect(result).to.be.flowxo.output.fields;
      }
    }

    cb(err);
  });
};

RunUtil.runRecorded = function(grunt, options, cb) {
  var runFile = path.join(
    options.runsFolder,
    RunUtil.getRunFile(grunt));

  var tests;
  try {
    tests = grunt.file.readJSON(runFile);
  } catch(e) {
    tests = [];
  }

  grunt.log.subhead(chalk.cyan('Recording test run, saving to ' + runFile));

  options.runCompleted = function(result, method, inputs) {
    tests.push({
      type: 'exec',
      method: method.slug,
      inputs: inputs
    });

    // Write the file after each successful run
    grunt.file.write(runFile, JSON.stringify(tests, null, 2));
  };

  RunUtil.runUntilStopped(grunt, options, cb);
};

RunUtil.runReplayed = function(grunt, options, cb) {
  var runner = options.runner,
    service = options.service,
    runFile = path.join(
      options.runsFolder,
      RunUtil.getRunFile(grunt));

  var tests = grunt.file.readJSON(runFile);

  grunt.log.subhead(chalk.cyan('Replaying test run from ' + runFile));

  /**
   * For each test we need to
   * - Display any title and description, if set
   * - Run the input.js script, and check it's format
   * - Display the standard_inputs and then the custom inputs
   * - Run the output.js script with the combined inputs
   * - Run the run.js script with the combined inputs
   * - Validate the output against the config
   * - Display the result to the user
   */
  var i = tests.length;
  async.eachSeries(tests, function(test, cb) {
    i--;
    RunUtil.run(grunt, {
      method: test.method,
      runner: runner,
      service: service,
      inputs: test.inputs
    }, function(err) {
      if(err) {
        grunt.fail.fatal(err);
      }

      if(i === 0) {
        // No more left, finish up.
        return cb();
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'next',
        message: 'Run next test?'
      }], function(answers) {
        return answers.next ? cb() : cb('Test Run Aborted');
      });
    });
  }, cb);
};

RunUtil.runTask = function(grunt, options) {
  var service = options.getService();

  if(service.methods.length === 0) {
    grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
  }

  var runner = new SDK.ScriptRunner(service, {
    credentials: grunt.file.readJSON(options.credentialsFile)
  });

  var runOpts = {
    service: service,
    runner: runner,
    runsFolder: options.runsFolder
  };

  var done = this.async();

  // Figure out options
  if(grunt.option('replay')) {
    RunUtil.runReplayed(grunt, runOpts, done);

  } else if(grunt.option('record')) {
    RunUtil.runRecorded(grunt, runOpts, done);

  } else if(grunt.option('single')) {
    RunUtil.runSingleScript(grunt, runOpts, done);

  } else {
    RunUtil.runUntilStopped(grunt, runOpts, done);
  }
};

module.exports = RunUtil;
