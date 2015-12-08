'use strict';

module.exports = function(service) {
  service.registerMethod({
    name: 'Dummy Method 1',
    slug: 'dummy_method_1',
    type: 'action',
    kind: 'task',
    scripts: {
      run: function(options, cb) {
        // Echo back the options, for testing
        cb(null, options);
      }
    },
    fields: {
      input: [{
        key: 'test',
        type: 'select',
        label: 'Test',
        input_options: []
      }],
      output: [{
        key: 'output',
        label: 'Output'
      }]
    }
  });
};
