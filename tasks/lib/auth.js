'use strict';

require('./check-deps');

var path = require('path'),
  open = require('open'),
  express = require('express'),
  session = require('express-session'),
  crypto = require('crypto'),
  url = require('url'),
  passport = require('passport'),
  refresh = require('passport-oauth2-refresh'),
  ScriptRunner = require('../../lib/scriptRunner.js'),
  fs = require('fs'),
  https = require('https');

var CommonUtil = require('./common');

var AuthUtil = {};

/**
 * Return a clone of an object
 */
var cloneObject = function(obj) {
  var cloned = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = obj[key];
    }
  }
  return cloned;
};

AuthUtil.handlers = {};

/**
 * Handler for OAuth1
 */
AuthUtil.handlers.oauth1 = function(grunt, service, options, cb) {
  var slug = service.slug.toUpperCase();

  var envs = [
    {
      option: 'consumerKey',
      key: slug + '_ID'
    },
    {
      option: 'consumerSecret',
      key: slug + '_SECRET'
    }
  ];

  var formatter = function(token, token_secret, profile, done) {
    done(null, {
      token: token,
      token_secret: token_secret,
      consumer_key: service.auth.options.consumerKey,
      consumer_secret: service.auth.options.consumerSecret,
      user_profile: profile
    });
  };

  AuthUtil.doOAuth(grunt, service, options, envs, formatter, cb);
};

/**
 * Handler for OAuth2
 */
AuthUtil.handlers.oauth2 = function(grunt, service, options, cb) {
  var slug = service.slug.toUpperCase();

  var envs = [
    {
      option: 'clientID',
      key: slug + '_ID'
    },
    {
      option: 'clientSecret',
      key: slug + '_SECRET'
    }
  ];

  var formatter = function(access_token, refresh_token, profile, done) {
    done(null, {
      access_token: access_token,
      refresh_token: refresh_token,
      user_profile: profile
    });
  };

  AuthUtil.doOAuth(grunt, service, options, envs, formatter, cb);
};

/**
 * Handler for basic Credentials
 */
AuthUtil.handlers.credentials = function(grunt, service, options, cb) {
  CommonUtil.promptFields(
    service.auth.fields,
    { validateRequired: false },
    function(err, credentials) {
      if (err) {
        return cb(err);
      }

      // Check the creds are valid
      var runner = new ScriptRunner(service, {
        credentials: credentials
      });

      runner.run('ping', function(err) {
        if (err) {
          return cb(err);
        }
        cb(null, credentials);
      });
    }
  );
};

/**
 * Handle OAuth flow
 */
AuthUtil.doOAuth = function(grunt, service, options, envs, formatCreds, cb) {
  if (!service.auth.strategy) {
    grunt.fail.fatal(
      'Unable to load strategy - please check you have a valid' +
        ' strategy defined in your `index.js` file.'
    );
  }

  var authOptions = cloneObject(service.auth.options);

  envs.forEach(function(env) {
    if (!authOptions[env.option]) {
      grunt.fail.fatal(
        'Unable to authenticate: no ' +
          env.option +
          ' defined. Did you remember to fill in your ' +
          env.key +
          ' in the .env file?'
      );
    }
  });

  var name = service.slug;
  var route = '/auth/service/' + name;
  var cbRoute = route + '/callback';

  // Calculate the callbackURL for the request
  var OAUTH_SERVER_URL =
    process.env.OAUTH_SERVER_URL ||
    'http' + (options.sslOAuthCallback ? 's' : '') + '://flowxo-dev.cc';

  // Calculate the port to listen on
  // PORT env var for Cloud9 support
  var OAUTH_SERVER_PORT =
    process.env.OAUTH_SERVER_PORT || process.env.PORT || 9000;

  var serverUrl = url.parse(OAUTH_SERVER_URL);

  var callbackURL = url.format({
    protocol: serverUrl.protocol,
    hostname: serverUrl.hostname,
    port: OAUTH_SERVER_PORT,
    pathname: cbRoute
  });

  authOptions.callbackURL = callbackURL;

  var strategy = new service.auth.strategy(authOptions, formatCreds);
  passport.use(name, strategy);

  var httpsServer;
  var app = express();
  app.use(
    session({
      secret: crypto.randomBytes(64).toString('hex'),
      resave: false,
      saveUninitialized: true
    })
  );

  app.use(passport.initialize());
  app.enable('trust proxy');

  app.get(route, passport.authorize(name, service.auth.params));

  app.get(cbRoute, passport.authorize(name), function(req, res) {
    res.status(200).send('Thank you. You may now close this window.');
    cb(null, req.account);
  });

  if (OAUTH_SERVER_URL.indexOf('https://') === 0) {
    grunt.log.writeln(['Using SSL Server for Auth']);

    var certsPath = path.join(__dirname, '..', '..', 'certs');
    var sslOptions = {
      key: fs.readFileSync(path.join(certsPath, 'ssl.key')),
      cert: fs.readFileSync(path.join(certsPath, 'ssl.cert')),
      requestCert: false,
      rejectUnauthorized: false
    };

    httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(OAUTH_SERVER_PORT);
  } else {
    app.listen(OAUTH_SERVER_PORT);
  }

  var userUrl = url.format({
    protocol: serverUrl.protocol,
    hostname: serverUrl.hostname,
    port: OAUTH_SERVER_PORT,
    pathname: route
  });

  grunt.log.writeln([
    'Opening OAuth authentication in browser. Please confirm in browser window to continue.'
  ]);
  grunt.log.writeln([
    'You can navigate manually to ' +
      userUrl +
      ' if a new window does not open.'
  ]);

  open(userUrl);
};

/**
 * Refresh oauth2 access token
 */
AuthUtil.refresh = function(grunt, options, cb) {
  var service = options.getService(),
    credentials = options.credentials;

  // Check this is oauth2
  if (service.auth.type !== 'oauth2') {
    grunt.fail.fatal('Only able to refresh OAuth2 services.');
  }

  if (!credentials) {
    grunt.fail.fatal('Unable to load existing authentication to refresh');
  }

  var callback = function(access_token, refresh_token, profile, done) {
    done(null, {
      access_token: access_token,
      refresh_token: refresh_token,
      user_profile: profile
    });
  };

  var strategy = new service.auth.strategy(service.auth.options, callback);
  refresh.use(strategy);

  refresh.requestNewAccessToken(
    strategy.name,
    credentials.access_token,
    function(err, accessToken, refreshToken) {
      if (!err) {
        credentials.access_token = accessToken;
        if (refreshToken) {
          credentials.refresh_token = refreshToken;
        }
      }

      cb(err, credentials);
    }
  );
};

AuthUtil.acquire = function(grunt, options, done) {
  var service = options.getService(),
    auth = service && service.auth,
    type = auth && auth.type;

  if (!auth) {
    grunt.log.ok('No authorization required.');
    return done();
  }

  var hdlr = AuthUtil.handlers[type];
  if (!hdlr) {
    grunt.fail.fatal(
      'Cannot authorize: no handler found for type ' +
        service.auth.type +
        '. Are you sure this is an OAuth service?'
    );
  }

  hdlr(grunt, service, options, done);
};

AuthUtil.runTask = function(grunt, options) {
  var self = this;
  var done = self.async();

  var storeCredentials = function(err, credentials) {
    if (!err) {
      CommonUtil.saveCredentials(grunt, credentials);
    }
    done(err);
  };

  if (grunt.option('refresh')) {
    AuthUtil.refresh(grunt, options, storeCredentials);
  } else {
    AuthUtil.acquire(grunt, options, storeCredentials);
  }
};

module.exports = AuthUtil;
