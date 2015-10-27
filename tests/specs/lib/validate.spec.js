'use strict';

var validate = require('../../../lib/validate.js');

describe('Validate', function() {

  describe('Flow XO datetime field', function() {
    it('should return no errors if the field is valid', function() {
      var data = {
        dateField: {
          type: 'date',
          valid: true,
          input: 'now',
          parsed: new Date()
        }
      };

      var constraints = {
        dateField: {
          fxoDatetime: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.be.undefined;
    });

    it('should return an error if the field is invalid', function() {
      var data = {
        dateField: {
          type: 'date',
          valid: false,
          input: 'hello',
          parsed: new Date('hello')
        }
      };

      var constraints = {
        dateField: {
          fxoDatetime: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Date field is not a valid datetime input');
    });

    it('should return an error with a custom message if the field is invalid', function() {
      var data = {
        dateField: {
          type: 'date',
          valid: false,
          input: 'hello',
          parsed: new Date('hello')
        }
      };

      var constraints = {
        dateField: {
          fxoDatetime: {
            message: '^Totally invalid!'
          }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Totally invalid!');
    });

    it('should return an error if a required field is not present', function() {
      var data = {};

      var constraints = {
        dateField: {
          fxoDatetime: { required: true }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Date field is required');
    });

    it('should return an error with a custom message if a required field is not present', function() {
      var data = {};

      var constraints = {
        dateField: {
          fxoDatetime: {
            required: true,
            message: '^Totally invalid!'
          }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Totally invalid!');
    });
  });

  describe('Flow XO boolean field', function() {
    it('should return no errors if the field is valid', function() {
      var data = {
        booleanField: {
          type: 'boolean',
          valid: true,
          input: 'true',
          parsed: true
        }
      };

      var constraints = {
        booleanField: {
          fxoBoolean: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.be.undefined;
    });

    it('should return an error if the field is invalid', function() {
      var data = {
        booleanField: {
          type: 'boolean',
          valid: false,
          input: 'hello',
          parsed: null
        }
      };

      var constraints = {
        booleanField: {
          fxoBoolean: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Boolean field is not a valid boolean input');
    });

    it('should return an error with a custom message if the field is invalid', function() {
      var data = {
        booleanField: {
          type: 'boolean',
          valid: false,
          input: 'hello',
          parsed: null
        }
      };

      var constraints = {
        booleanField: {
          fxoBoolean: {
            message: '^Totally invalid!'
          }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Totally invalid!');
    });

    it('should return an error if a required field is not present', function() {
      var data = {};

      var constraints = {
        booleanField: {
          fxoBoolean: { required: true }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Boolean field is required');
    });

    it('should return an error with a custom message if a required field is not present', function() {
      var data = {};

      var constraints = {
        booleanField: {
          fxoBoolean: {
            required: true,
            message: '^Totally invalid!'
          }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Totally invalid!');
    });
  });

  describe('Built-in datetime field', function() {
    it('should return no errors if the field is valid', function() {
      var data = {
        dateField: 'now'
      };

      var constraints = {
        dateField: {
          datetime: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.be.undefined;
    });

    it('should return an error if the field is invalid', function() {
      var data = {
        dateField: 'hello'
      };

      var constraints = {
        dateField: {
          datetime: true
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Date field must be a valid date');
    });

    it('should return an error with a custom message if the field is invalid', function() {
      var data = {
        dateField: 'hello'
      };

      var constraints = {
        dateField: {
          datetime: {
            message: '^Totally invalid!'
          }
        }
      };

      var errors = validate(data, constraints);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.eql('Totally invalid!');
    });
  });
});
