'use strict';

require('./check-deps');

var util = require('util'),
  path = require('path'),
  inquirer = require('inquirer'),
  chalk = require('chalk'),
  async = require('async'),
  _ = require('lodash'),
  chai = require('chai'),
  FxoUtils = require('flowxo-utils'),
  Assertions = require('../../lib/assertions.js'),
  SdkError = require('../../lib/error.js'),
  ScriptRunner = require('../../lib/scriptRunner.js'),
  localtunnel = require('localtunnel'),
  express = require('express'),
  bodyParser = require('body-parser');

// Add XML parsing support
require('body-parser-xml')(bodyParser);

chai.use(Assertions);

var CommonUtil = require('./common');

var RunUtil = {};

RunUtil.filterEmptyInputs = function(inputs) {
  return inputs.filter(function(input) {
    return 'value' in input;
  });
};

RunUtil.displayScriptData = function(grunt, data) {
  CommonUtil.header(grunt, 'DATA:', 'green');
  grunt.log.writeln(chalk.cyan(JSON.stringify(data, null, 2)));
};

/**
 * Processes the data returned from a script
 * into a format suitable for outputting.
 * @param  {Array} outputs Flow XO Output Field objects
 * @param  {Object} data Data returned from script
 * @return {Array} Processed data - either an array of fields, or an
 * array of arrays if the incoming data
 */
RunUtil.formatScriptOutput = function(outputs, data) {
  var getValueFromKeys = function(keys, data) {
    return _.reduce(keys, function(prev, key) {
      if(prev) {
        return prev[key];
      }
      return null;
    }, data);
  };

  return FxoUtils.annotateOutputData(data, outputs, {
    includeEmptyFields: true,
    arrayFormatter: function(keys, data) {
      if(!data) {
        return '';
      }
      return data
        .map(function(item) {
          return getValueFromKeys(keys, item)
        })
        .filter(function(item) {
          return item;
        });
    }
  });
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

function getConstructorName(value) {
  if(value == null) { // is it undefined or null
    return String(value);
  }

  return value.constructor.name;
}

function getFallbackErrorMessage(err) {
  switch(err.__fxotype__) {
    case 'AuthError':
      return 'The request failed because of an authorization problem.';
    case 'ServiceError':
      return 'There was an error with your task, please contact support.';
    default:
      return 'The request failed because something unexpected happened.';
  }
}

RunUtil.getNormalizedErrorMessage = function(err) {
  if(!(err instanceof SdkError.BaseError)) {
    return getFallbackErrorMessage(err);
  }

  if(err.message) {
    return err.message;
  }

  // Try and get the message from the embedded exception.
  if(err.err) {
    if(err.err.message) {
      return err.err.message;
    }

    if(_.isFunction(err.err.toString)) {
      return err.err.toString();
    }
  }

  // No message? Use the fallback.
  return getFallbackErrorMessage(err);
}

RunUtil.displayScriptError = function(grunt, err) {
  /**
   * The info contains the exception type in the header, and a message, which
   * is the same as it would have been in the core.
   *
   * If the process was ran with the `stack` option enabled (grunt run --stack),
   * then additional stack trace will be printed.
   */

  var errorType = getConstructorName(err);
  // The same message will be used in the core
  var message = RunUtil.getNormalizedErrorMessage(err);

  CommonUtil.header(grunt, 'Script Error (type: ' + errorType + ')', 'red');
  grunt.log.writeln(chalk.red(message));

  if(grunt.option('stack')) {
    CommonUtil.header(grunt, 'Stack Trace', 'red');
    if(err.stack) {
      grunt.log.writeln(chalk.red(err.stack));
    } else {
      grunt.log.writeln(chalk.gray(err.stack));
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
  if(method.type === 'poller') {
    chai.expect(result).to.be.a.flowxo.poller.script.output;
  } else {
    chai.expect(result).to.be.a.flowxo.script.output;
  }
};

RunUtil.getCredentials = function(grunt, credentialsPath) {
  try {
    return grunt.file.readJSON(credentialsPath);
  } catch(e) {
    return {};
  }
};

RunUtil.getRunFile = function(grunt) {
  return(grunt.option('name') || 'runs') + '.json';
};

RunUtil.splitWithEscaped = function(input, delimiter) {
  var parts = [];

  if(_.isString(input)) {
    var matcher = new RegExp('(\\\\.|[^' + delimiter + '])+', 'g');
    var replacer = new RegExp('\\\\' + delimiter + '', 'g');

    parts = input.match(matcher) || [];
    parts = parts.map(function(str) {
      return str.replace(replacer, delimiter);
    });
  }

  return parts;
};

RunUtil.convertDictInputToObject = function(input) {
  if(!_.isString(input)) {
    return {};
  }

  var parts = RunUtil.splitWithEscaped(input, '&');
  return parts.reduce(function(hash, part) {
    var pair = RunUtil.splitWithEscaped(part, '=');
    var key = pair[0];
    if(key && !(key in hash) && pair.length > 1) {
      pair.shift();
      hash[key] = pair.join('=');
    }
    return hash;
  }, {});
};

RunUtil.processInput = function(input, answers) {
  // Add each field to the return object,
  // along with the answer.
  var i = _.assign({}, input, {
    type: input.type || 'text'
  });

  if(answers[input.key]) {
    i.value = answers[input.key];
    // Perform some post-processing on the value,
    // according to the field type.
    switch(i.type) {
      case 'text':
      case 'textarea':
        // Handle empty string
        if(i.value === '\'\'' || i.value === '""') {
          i.value = '';
        }
        break;

      case 'dictionary':
        // Convert to a JSON object.
        i.value = RunUtil.convertDictInputToObject(i.value);
        break;
    }
  }

  return i;
};

RunUtil.harvestInputs = function(grunt, runner, method, inputs, callback) {
  var fieldPromptOptions = {
    validateRequired: false
  };

  function doPrompts(inputSet) {
    // If any of our fields have dependencies,
    // we need to run the input.js when they change.
    var extraSet = [];

    inputSet = inputSet.map(function(input) {
      var optionsIdx, repeatedOptions;

      input = _.cloneDeep(input);

      if(input.dependants) {
        input.after = function(results, done) {
          var dataToSend = {
            input: {
              target: input.key,
              // Merge the local results with the ones already harvested.
              fields: _.assign({}, inputs.reduce(function(hash, i) {
                hash[i.key] = i.value;
                return hash;
              }, {}), results)
            }
          };
          runner.run(method.slug, 'input', dataToSend, function(err, updatedInputFields) {
            if(err) {
              return callback(err);
            }

            // Add the fields to the input set
            if(updatedInputFields) {
              updatedInputFields.forEach(function(f) {
                extraSet.push(f);
              });
            }
            done();
          });
        };

      } else if(input.type === 'select') {
        // Add an extra option to the list.
        var key = input.key;
        var manualOption = '__fxo_select_manual_' + key + '_' + Date.now() + '__';
        input.input_options.push({
          label: '<enter manually>',
          value: manualOption
        });

        // After the prompt, check if it was selected.
        // If so, create an input field to overwrite.
        input.after = function(results, done) {
          if(results[key] !== manualOption) {
            return done();
          }

          inquirer.prompt({
            name: key,
            type: 'input',
            message: input.label + ' (enter manually):'
          }, function(r) {
            results[key] = r[key];
            done();
          });
        };
      }

      // We need to ensure that there aren't any repeated options here,
      // as this is not supported by the core.
      if(input.input_options) {
        optionsIdx = {};
        repeatedOptions = '';
        input.input_options.forEach(function(opt) {
          optionsIdx[opt.value] = optionsIdx[opt.value] || [];
          optionsIdx[opt.value].push(opt.label);
        });

        _.forOwn(optionsIdx, function(val, key) {
          if(val.length > 1) {
            // Repeated option alert.
            repeatedOptions += '\n - Labels ' + val.join(', ') + ' are linked to the value ' + key;
          }
        });

        if(repeatedOptions.length) {
          grunt.fail.fatal('Repeated option values detected for input field \'' + input.key + '\': ' + repeatedOptions + '\n\nOption values must be unique, please amend and try again.');
        }
      }

      return input;
    });

    CommonUtil.promptFields(inputSet, fieldPromptOptions, function(err, answers) {
      if(err) {
        return callback(err);
      }

      inputSet.forEach(function(input) {
        // Concatenate to the master `inputs`.
        inputs.push(RunUtil.processInput(input, answers));
      });

      // If there are any extra questions, ask them.
      if(extraSet.length) {
        return doPrompts(extraSet);
      }

      // Otherwise, we are finished.
      return callback(null, inputs);
    });
  }

  if(!method.scripts.input) {
    // If we are here, there must be some static inputs but no custom
    doPrompts(method.fields.input);
  } else {
    runner.run(method.slug, 'input', function(err, customInputFields) {
      if(err) {
        return callback(err);
      }

      try {
        chai.expect(customInputFields).to.be.flowxo.input.fields;
      } catch(e) {
        grunt.fail.fatal('Error in return from input.js script: ' + e.toString());
      }
      var combinedInputs = [];
      if(method.fields.input) {
        combinedInputs = combinedInputs.concat(method.fields.input);
      }
      if(customInputFields) {
        combinedInputs = combinedInputs.concat(customInputFields);
      }
      doPrompts(combinedInputs);
    });
  }
};

RunUtil.run = function(grunt, options, cb) {
  var runner = options.runner,
    service = options.service,
    method = options.method,
    result;

  // Firstly, validate the service.
  // If it is not configured correctly, end.
  RunUtil.validateService(grunt, service);

  var inputs = options.inputs || [],
    filteredInputs = [],
    outputs = [];

  var inputsPredefined = options.hasOwnProperty('inputs');

  async.waterfall([
    // Method Selection
    function(callback) {
      if(typeof method !== 'undefined') {
        method = service.getMethod(method);
        CommonUtil.header(grunt, 'Method: ' + method.name);
        callback();
      } else {
        CommonUtil.header(grunt, 'Method Selection');
        RunUtil.promptMethod(service, function(err, m) {
          method = m;
          callback();
        });
      }
    },

    // Inputs
    function(callback) {
      // First determine whether we're going to do anything at all
      if((method.fields.input && method.fields.input.length) || method.scripts.input) {
        CommonUtil.header(grunt, 'Input Fields');
      } else {
        return callback();
      }

      // If we've been given them, just set and move on
      if(inputsPredefined) {
        inputs.forEach(function(input) {
          // Not actually a prompt:
          // instead just display to the screen.
          var prompt = CommonUtil.createPrompt(input);
          grunt.log.writeln(chalk.magenta(' ' + prompt.message + ' ' + prompt.value));
        });
        return callback();
      }

      // Otherwise, harvest the inputs.
      RunUtil.harvestInputs(grunt, runner, method, inputs, function(err) {
        callback(err);
      });
    },

    function(callback) {
      // Filter out any empty inputs
      filteredInputs = RunUtil.filterEmptyInputs(inputs);

      // output.js
      if(method.fields.output) {
        outputs = outputs.concat(method.fields.output);
      }

      if(!method.scripts.output) {
        return callback();
      }

      runner.run(method.slug, 'output', {
        input: filteredInputs
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
          callback();
        }
      });
    },

    // run.js
    function(callback) {

      // If it's a webhook, delegate off
      if(method.type === 'webhook') {
        return RunUtil.runWebhook(grunt, options, method, callback);
      }

      // Otherwise, run the method
      runner.run(method.slug, 'run', { input: filteredInputs }, callback);
    },

    // validation and output
    function(r, callback) {
      result = r || {};

      RunUtil.displayScriptData(grunt, result);
      RunUtil.displayScriptOutput(grunt, outputs, result);

      try {
        RunUtil.checkRunScriptResult(result, method);
      } catch(e) {
        CommonUtil.header(grunt, 'VALIDATION:', 'red');
        grunt.fail.fatal(e);
      }
      callback();
    }
  ], function(err, result) {
    // Callback enough data so the caller can record
    // the run
    cb(err, result, method, inputs);
  });
};

RunUtil.runUntilStopped = function(grunt, options, cb) {
  function runIt() {
    RunUtil.run(grunt, options, function(err, result, method, inputs) {
      if(err) {
        RunUtil.displayScriptError(grunt, err);
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
      if((userScript === 'run' || userScript === 'output') &&
         (method.fields.input || method.scripts.input)) {
        var inputs = (method.fields && method.fields.input) || [];
        RunUtil.harvestInputs(grunt, runner, method, inputs, callback);
      } else {
        callback(null, []);
      }
    },
    // Run the script
    function(inputs, callback) {
      // Remove any empty inputs
      var filteredInputs = RunUtil.filterEmptyInputs(inputs || []);
      runner.run(method.slug, script, {
        input: filteredInputs
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

  function displayTitle(title) {
      grunt.log.subhead(chalk.magenta(title));
    }
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

    // If there's a title, display it
    if(test.title) {
      displayTitle(test.title);
    }

    RunUtil.run(grunt, {
      method: test.method,
      runner: runner,
      service: service,
      inputs: test.inputs
    }, function(err) {
      if(err) {
        RunUtil.displayScriptError(grunt, err);
      }

      if(i === 0) {
        // No more left, finish up.
        return cb();
      }

      grunt.log.writeln('');

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

/**
 * Run a Webhook method
 */
RunUtil.runWebhook = function(grunt, options, method, callback) {
  var localtunnelOpts = {};

  var prefs = CommonUtil.loadConfig(grunt);
  if(prefs.localtunnelSubdomain) {
    localtunnelOpts.subdomain = prefs.localtunnelSubdomain;
  }

  // First get a URL
  localtunnel(options.webhookPort, localtunnelOpts, function(err, tunnel) {
    if(err) {
      return callback('Failed to get URL for Webhook: ' + err);
    }
    // Configuration text
    if(method.help && method.help.webhook && method.help.webhook.config && method.help.webhook.config.length > 0) {
      CommonUtil.header(grunt, 'Webhook Configuration');
      method.help.webhook.config.forEach(function(line) {
        grunt.log.writeln('* ' + line);
      });
    }

    // URL
    CommonUtil.header(grunt, 'Webhook URL');
    grunt.log.writeln(chalk.cyan(tunnel.url));

    // Text text
    if(method.help && method.help.webhook && method.help.webhook.test && method.help.webhook.test.length > 0) {
      CommonUtil.header(grunt, 'Webhook Test');
      method.help.webhook.test.forEach(function(line) {
        grunt.log.writeln('* ' + line);
      });
    }

    // Start an express server
    var app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    // These are the same options as used
    // by the Flow XO core platform.
    app.use(bodyParser.xml({
      explicitArray: false,
      trim: true,
      normalize: true,
      normalizeTags: true,
      mergeAttrs: true,
      charkey: 'value',
      attrNameProcessors: [function(attr) {
        return '@' + attr;
      }]
    }));

    app.post('/', function(req, res) {
      res.status(200).send('OK');
      options.runner.run(method.slug, 'run', { input: req.body }, function(err) {
        // If the exception is SdkError.WebhookIgnoreError then behave as if
        // there was no data.
        if(!(err instanceof SdkError.WebhookIgnoreError)) {
          callback.apply(this, arguments);
        }
      });
    });
    app.listen(options.webhookPort);

    grunt.log.writeln('\n\rWaiting for webhook data...');

    // If the subdomain is different, store it in the prefs file.
    var subdomain = tunnel.url
      .replace(/^https:\/\/(.*).localtunnel.me$/, '$1');
    if(subdomain !== prefs.localtunnelSubdomain) {
      prefs.localtunnelSubdomain = subdomain;
      CommonUtil.saveConfig(grunt, prefs);
    }
  });
};

RunUtil.runTask = function(grunt, options) {
  var service = options.getService();

  if(service.methods.length === 0) {
    grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
  }

  var runner = new ScriptRunner(service, {
    credentials: CommonUtil.loadCredentials(grunt)
  });

  var runOpts = {
    service: service,
    runner: runner,
    runsFolder: options.runsFolder,
    webhookPort: options.webhookPort || 9095
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
