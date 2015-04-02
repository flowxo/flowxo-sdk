Introduction
============

[Flow XO](https://flowxo.com) is a platform that lets users build automated sales & marketing workflows on top of their existing cloud apps.

Each supported service is built as a 'module' which is called by the Flow XO 'core'.  A service is split into separate _methods_, and each method is either a _trigger_ (looks for new records) or an _action_ (creates, updates or deletes records).

We've opened up our SDK so that anyone can build support for their service into Flow XO.  The SDK gives you scaffolding for your service, a command-line tool to run your methods locally, tools to write tests and some examples of working services.  Not forgetting these docs which should hopefully guide you through the process.

If you get stuck, just send us an email at [support@flowxo.com](mailto:support@flowxo.com) and we'll try our best to guide you.

Prerequisites
=============

Flow XO runs on [Node.js](https://nodejs.org/).  Make sure you're using Node.js [v0.12.0](https://nodejs.org/docs/v0.12.0/api/) as that's the version we run.  If you don't have Node.js, you can [download it here](http://nodejs.org/dist/v0.12.0/docs/download/).

You'll also need to be familiar with [Git](http://git-scm.com/) as you'll be using it to clone our SDK and submit your service for review.  We use [Bitbucket](https://bitbucket.org/) to host services code as it allows pull requests across private repos.

As most modules will be fairly thin wrappers around HTTP API's, you should understand how to make HTTP requests in Node.  We encourage you to use the popular [Request](https://github.com/request/request) module, but you can choose to make requests with Node's plain [https](https://nodejs.org/docs/v0.12.0/api/https.html) API if you prefer.

Finally, build and test related tasks are handled by the Javascript task runner [Grunt](http://gruntjs.com/) so a working knowledge of this is useful.

That's all.  The other tools that the SDK calls on will be installed locally with the `npm install`.

Scaffolding Your Service
========================

You should start your service using our [Yeoman](http://yeoman.io/) generator. This can be installed using [npm](https://npmjs.org), but as the generator is not publicly available, you need to specify the github user and repo when installing:

    npm install flowxo/flowxo-generator

You should now be able to run `yo flowxo` to generate a service.

If you select a _Credentials_ service, you'll be asked to define the fields that the user must complete. Normally this would be a username, password, API key, token, account name, etc.  Just define all the fields you'll need to collect in order to access and authorize against your service's API.  See the _Authorization > Credentials_ section for more information.

If you select an _OAuth1_ or _OAuth2_ service, some skeleton configuration will be created that will need to be updated later.  See the _Authorization > OAuth_ section for how to do this.

You should now have a populated directory with some scripts.  Next, we'll take a look at what we've generated.

Code Structure
==============

A service is a collection of JS files, with scripts relating to the service as a whole at the root, and a directory for each method beneath that.

This is how your service will eventually be structured (although you won't have any methods yet):

    service_name
    |-- index.js - describes the service & authorization fields, and holds shared functions
    |-- ping.js - the core runs this to check authorization
    |-- methods
        |-- method_name
            |-- config.js - describes the method & input/output fields
            |-- run.js - the core calls this script to run the method
            |-- input.js - optional, returns dynamic input fields
            |-- output.js - optional, returns dynamic output fields
        |-- another_method
            |-- ...

There's a few other files you might also have in your root, including `README.md`, `credentials.json` and `.gitignore`.

Requiring the SDK
-----------------

    var sdk = require('flowxo-sdk');

The SDK exposes these properties:

- `Service`: The main service object, return an instance of this in `index.js`.
- `Error`: Contains a set of Flow XO error objects (see _Creating Methods > Handling Errors_).
- `Utils`: Utility functions.

Scripts
-------

A FlowXO service is built up of some configuration plus a number of _scripts_.
`ping.js`, `run.js`, `input.js` and `output.js` all work in a similar way.

They're passed an `options` object along with a callback function `done` that accepts either an `err` or an `output` object:

    module.exports = function(options, done) {
      /* Do something here */
      done(err, output);
    }

Your script receives the input and does whatever work is necessary.  If all is well, the script should call `done(null, object)`.  If there's a problem, tell the core about it by returning `done(err)` (see the section on _Creating Methods > Handling Errors_).

Each type of script will be explained in more detail later.

index.js
---------

The `index.js` file at the root of your module defines the service.  It looks something like this:

    var service = new sdk.Service({
      name: 'Your Service',
      slug: 'your_service',
      auth: {
        ...
      }
    });

    module.exports = service;

The FlowXO core will `require` your service like any other node module. Our module exports only one thing - an instance of the `sdk.Service` object configured for our service.

This script is also a place to hold your shared code.  It's common to create a function that abstracts the handling of HTTP requests, and perhaps a function that handles errors.

Take a look at the example modules to see what kind of code you should be centralising here.

ping.js
-------

The core sometimes needs to check whether it's able to connect to your service.  For example, after the user has provided their credentials to connect a new account, the core will call `ping.js` to check those credentials work.

You'll be passed an `options` object containing the credentials that the user supplied (in `options.credentials`), and like the other scripts you should either call `done(null)` to indicate success or `done(err)` to indicate error:

    module.exports = function(options, done) {
      /* Check the credentials */
      if (err) {
        done(err);
      } else {
        done(null);
      }
    }
s
Authorization
=============

Flow XO supports credential based auth (where the user provides some kind of secret that can be used for authorization) or the [OAuth](http://oauth.net/) protocol, where the user grants access directly through the service being accessed. Both OAuth1 and OAuth2 are supported.

Credentials
-----------

We support authorization with credentials (an API key, token, username/password or actually any combination of fields) which are passed into your scripts at runtime and can then be used to authorize requests.

Usually that means sending credentials in the request headers or query string, or perhaps exchanging the credentials for a token before using that in requests.

To configure credentials based auth, you'll need to edit the `auth` property in the `index.js` file at the root of your service.

For example, if you need to collect 2 fields, an API key and an account name, you should declare those fields like this:

    auth: {
      type: 'credentials',
      fields: [
        {
          type: 'text',
          key: 'apikey',
          label: 'API Key',
          description: 'Find this under settings.',
          required: true
        },
        {
          type: 'text',
          key: 'account',
          label: 'Account',
          description: 'The name of your account.',
          required: true
        }
      ]
    }

See the section _Creating Methods > Input Field Types_ for a list of the field types you can use here.

When your scripts are run, you'll get the credentials in `options.credentials`.

OAuth
-----

Alternatively, we support [OAuth](http://oauth.net/) (versions [1.0](http://oauth.net/core/1.0/), [1.0a](http://oauth.net/core/1.0a/) and [2.0](http://oauth.net/2/)).

If there's a choice, it's usually better to use OAuth as the user experience will be much better than copying & pasting credentials.

Flow XO relies on the [Passport](http://passportjs.org/) library for managing OAuth1 and OAuth2 authentication. If you have created an OAuth service, the generated `index.js` file contains a skeleton auth configuration with enough helper text to get you started. The basic task is to update the `strategy` property with a valid Passport strategy, and to configure the options (clientID and clientSecret) and params (scope, state, etc) that you need. An example for a Facebook service might look like...

    auth: {
      type: 'oauth2',
      strategy: require('passport-facebook').Strategy,
      options: {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET
      },
      params: {
        scope: ['email','user_likes']
      }
    }

When your scripts are run, you'll get the relevant credentials in the `options.credentials` object. For example for OAuth2 you would get `{access_token: <token>, refresh_token: <refresh_token>}`, which can then be used when making requests to the API.

You'll also need to take special care to use an _Auth Error_ when the API reports an authorization problem.  That way, the core knows to try and refresh the access token and try your script again (when possible).  See the section _Handling Errors > OAuth Errors_ for details.

Local Testing
-------------

Your service's Gruntfile.js contains a task:

    grunt auth

This will take you through generating a set of auth credentials that you can use locally to test your scripts.

- If your service uses credentials, you'll simply be asked to complete the required fields e.g. API Key.
- If you're using OAuth, a browser window will open asking you to authorize.

Credentials are stored in an `credentials.json` in the root of your service.  Of course, this file should **not** be committed to version control.  The default `.gitignore` takes care of this.

Creating Methods
================

The [FlowXO Generator](https://github.com/flowxo/flowxo-generator) contains a generator to scaffold individual methods as well as entire services. Simply run `yo flowxo:method` and follow the steps to generate a new method.

Methods are stored in the `methods` folder on the root of your service. Each method has it's own folder with the name being the `slug` of the method. Inside each method folder you'll see the following set of files:

config.js
---------

Each method has its own `config.js` file, which defines the method's name, what type of method it is, and describes its input/output fields.

A typical config file looks like this:

    var config = {
      name: 'A Method',
      slug: 'a_method',
      type: 'poller',
      kind: 'trigger',
      scripts: {
        run: require('./run'),
        input: require('./input')
      },
      fields: {
        input: [...],
        output: [...]
      }
    }

    module.exports = function(service) {
      service.registerMethod(config);
    };

- `type` - Accepts values of `poller` (see the section _Polling_), `webhook` (see the section _Webhooks_) or `action` (anything else).
- `kind` - Defines the method as either a `trigger` or `task`.
- `scripts` - All methods should have a `run` script.  You can reference an `input` and/or an `output` script too.  Use input/output scripts to dynamically define fields that are generated at runtime and show alongside the static fields you define in the `fields` property.  See the _input.js_ and _output.js_ sections for more details.
- `fields` - Contains `input` and `output` objects which hold arrays of fields that define the fields that will be available for input to the script, and the properties that your script will output (on success).  See the sections on _Input Fields_ and _Output Fields_.

input.js
--------

Sometimes it's necessary to generate fields at runtime.  As an example, if our method has an input _User_, then it's usually best to load up a list of users into a select box rather than expect a user ID.  We won't know who those users are until the account has been authorized, and that list might change from time to time.

So the way forward is to use an `input.js` script.  The script is very similar to `run.js`, except it either returns an error, or an array of input fields on success.  See the section _Input Fields_ for the format of the array you should return.

output.js
---------

`output.js` scripts are executed at runtime and augment the static output fields defined in the `config.js`.

Use an output script where the service supports 'custom fields'.  For example, many [CRM's](http://en.wikipedia.org/wiki/Customer_relationship_management) allow administrators to define extra data fields alongside standard fields such as name, phone, etc.

The script is very similar to `run.js`, except it either returns an error, or an array of output fields on success.  See the section _Output Fields_ for the format of the array you should return.

Note that `options.input` will hold the input values that the user has given to the method.  Note that any `{{outputs}}` from other tasks in those values will be replaced with empty strings.

run.js
------

This is the primary script of the method. Like every other script, you'll be passed an `options` object and `done` (a callback).  The script should do its work and either call `done(err)` or `done(null, output)`.

    module.exports = function(options, done) {
      /* Do some stuff */
      done(null, [Object]);
    }

The `options` object contains the following properties:

    {
      credentials: {
        /* auth credentials */
      },
      input: {
        /* input values */
      },
      // triggers only....
      polling: [Function]
    }

The `output` object should be the data returned by the method:

    {
      key: 'Some Value',
      another_key: 'Another value'
    }

All the keys that your script might output should be included in the output fields described in the method's `config.js` (or `output.js`).

**Note** For poller scripts, the `output` object should be an `Array` of objects, one per new item found.

Input Fields
------------

Input fields should be provided as an array of objects that describe what type of data the input field accepts and how it is to behave in the UI.

The most basic input field is `text` (the default if `type` isn't specified):

    {
      key: 'first_name',
      label: 'First Name',
      type: 'text' // Optional, 'text' is the default
    }

You can make any field required:

    {
      key: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true
    }

Note that the UI will ensure there's some kind of value in a required field, but that might be a property from another task and be empty, so you'll still need to check for empty fields within your script.

Fields can also have a default value:

    {
      key: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
      default: 'John'
    }

It's also helpful to provide some extra description to help the user understand how to use the field.  Do that with a `description`:

    {
      key: 'first_name',
      label: 'First Name',
      type: 'text',
      description: 'You know what this is, right?'
    }

The description is displayed underneath the field.

You can also use text areas, select boxes, special date/time fields and boolean fields.

### Text Areas ###

    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    }

### Select Boxes ###

    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      default: 1,
      input_options: [
        {
          label: 'Low',
          value: 1
        },
        {
          label: 'Medium',
          value: 2
        }
      ]
    }

### Date/Time Fields ###

    {
      key: 'due',
      label: 'Due Date',
      type: 'datetime'
    }

You can learn more about date/time fields in our [knowledge base](http://support.flowxo.com/article/9-dates-times).  The field attempts to coerce any value into a valid [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) format date/time.  It makes it easy for users to exchange dates between services.

The value of a date/time field will always be passed into your script as an object after being processed by the core:

    {
      type: 'date',
      string: 'tomorrow',
      valid: true,
      parsed: [Date Object]
    }

You'll find the original value in `string`, a flag to say whether the date is `valid`, and `parsed` which will either contain `null` or a valid date object.

To stringify the date into ISO 8601 format, you can use [Moment.js](http://momentjs.com/) (an authorized library):

    var moment = require('moment');
    var dateTimeString = moment(datetime.parsed).toISOString();

Alternatively you can use `moment.format()` to format the date exactly as you need it.

### Boolean Fields ###

    {
      key: 'active',
      label: 'Active',
      type: 'boolean',
      input_options: [ // Optional
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    }

If you don't specify `input_options`, the options will default to _Yes_ and _No_.

A boolean field type will attempt to coerce a select box value into `true` or `false`.  It can handle the values `true`, `false`, `yes`, `no`, `1` or `0`.

It's similar to date/time in that the value passed to your script will always be an object:

    {
      type: 'boolean',
      string: 'yes',
      valid: true,
      parsed: true
    }

You'll find the original value in `string`, a flag to say whether the boolean is `valid`, and `parsed` which will either contain `null`, `true` or `false`.

Output Fields
-------------

Output fields should be provided as an array of objects that describe what data the script will output (its output 'properties').

Each property is described like so:

    {
      key: 'email',
      label: 'Email Address'
    }

You should describe all properties that your script _might_ output.

Output Flattening
-----------------

Output data in Flow XO will be converted to un-nested key/value pairs by the core.  For example, take this object:

    {
      name: 'My deal',
      people: [
        {
          name: 'John Doe',
          phone: '0207 000 0000',
          email: 'john.doe@example.com'
        },
        {
          name: 'Jane Doe',
          phone: '0208 000 0000',
          email: 'jane.doe@example.com'
        },
        {
          name: 'Jim Smith',
          phone: '0800 000 000',
          email: 'jim.smith@example.com'
        }
      ],
      meta: {
        status: 'Open',
        assigned: true
      }
    }

Once it's passed to the core, it's converted to:

    {
      name: 'My deal',
      people_name: 'John Doe',
      people_phone: '0207 000 0000',
      people_email: 'john.doe@example.com',
      people_2_name: 'Jane Doe',
      people_2_phone: '0208 000 0000',
      people_2_email: 'jane.doe@example.com',
      people_3_name: 'Jim Smith',
      people_3_phone: '0800 000 0000',
      people_3_email: 'jim.smith@example.com',
      meta_status: 'Open',
      meta_assigned: true
    }

You'll see that we try and give array items sensible, readable keys.  The first item of an array or a single object with the same properties will always have the same keys, that helps in situations where an API returns either an object or array depending on the number of items.

When you name your output keys, you should use their 'flattened' key.

TODO: Check if the core's flatten function treats objects and arrays with a single item the same?

Polling
-------

Flow XO supports 2 trigger mechanisms, polling and webhooks.  Polling involves hitting an API periodically to check for new items, and is the most popular way of building a trigger.  Polling is more resource intensive than webhooks, but they're much easier for users to set up (currently users have to manually configure webhooks).

At present, polling triggers are checked every minute.  Sometimes your method will be called just to populate the cache of existing records (when the method is first set up, when it's changed or after the workflow is reactivated).

The polling process is actually quite straightforward:

1. Fetch a time ordered list of items from the API (newest first).  Set a sensible limit on the number of results, 10, 25 or 50 results is usually enough.
2. Pass the array of items to `options.poller`, along with a string referencing the property that holds the unique ID for each item in the list, and finally a callback.
3. Your callback will be passed an array of new items (or an empty array), which can then be processed further and passed back as the result.

You can define your method as a polling trigger in `config.js`:

    var config = {
      name: 'A Polling Trigger',
      slug: 'a_polling_trigger',
      type: 'poller',
      kind: 'trigger',
      ...
    }

Polling scripts will be passed a special function in their `options.poller` property, which will take care of a lot of the work:

    options.poller(data, key, callback);

All you need to do is give it a list and tell it what property within each list item holds the ID. A callback is fired with an array of new items.

- `data` (Array) - An array that is to be checked for new items.  This will often come directly from an API, but you may need to pick out the property containing the list of items.
- `key` (String) - The property that holds the unique ID for each item in the list.  For example, on Twitter's `timelines.user` endpoint, each tweet that's returned contains an `id_str` property which is the unique ID for the tweet. In this case, set the key to `id_str`.
- `callback(err, newItems)` - The callback function is called with either an error, or if successful, an array containing the new items found (those with a key that hasn't been seen before).  The array might be empty if no new items are found.

Internally, the `options.poller` function asks the database whether each key has been seen before, and if not, adds it to the array of items it returns.  The core will then update the cache of items once it's handed the list of new items.

To see polling triggers in action, study the examples included in the SDK.

Webhooks
--------

Flow XO has general [webhooks support](http://support.flowxo.com/article/22-webhooks), but methods within services can be triggered by webhooks too.

Users follow a similar process to setting up general inbound webhooks:

1. They're given instructions of how to set up the webhook and given the webhook URL to copy and paste.
2. Once it's in place, they fire off a test webhook.
3. We receive the test and complete the set up.

To define your method as a webhook trigger, set your `config.js` up like this:

    var config = {
      name: 'A Webhook Trigger',
      slug: 'a_webhook_trigger',
      type: 'webhook',
      kind: 'trigger',
      help: {
        webhook: {
          config: [
            'Copy the webhook URL to your clipboard.',
            'In your account, go to settings and paste it in.'
          ],
          test: [
            'Create a new record to test your webhook.'
          ]
        }
      },
      ...
    }

You should provide a `help` property to tell the user how to configure the webhook in your service.  `help.webhook.config` and `help.webhook.test` accept an array of paragraphs to display to the user.

Handling Errors
---------------

The callback for your script expects either an error (if the request failed) or an object (on success).  This section will help you to understand how to construct your errors.

### Retryable Errors ###

These occur when you can't access a service or you get a response back in a format that you don't recognise.  They're usually recoverable, and so the platform will retry the request later.

When you encounter a retryable error, return a regular JavaScript error as the error argument in your callback.  Either create a new one (`new Error()`) or hand back the error object passed in from a library such as `request`.

You should use a Retryable Error in situations like these:

- HTTP requests fail.  For example, where you use `request.post()` to call the API and your callback receives an error object.
- Where you receive a 500 status code from the API, and you were expecting 200.
- If you receive a 200 status code (as expected) and test for the presence of a `result` JSON key in the body, but find that it's not there.
- A `JSON.parse` of the API's response throws an error.

Depending on the situation, you can either return an error object directly, or create a new error:

- `done(err)` (problem connecting to API)
- `done(new Error(response.statusCode + ' ' + body))` (some kind of temporary error reported by API)
- `done(new Error('Could not parse: ' + body))` (API returns invalid JSON)

It's up to you what information your error contains, but make sure it describes the problem.  The user will never see these error messages, they're logged and monitored by Flow XO.

The platform will retry the request up to 5 times (with exponential back-off), and if after the 5th attempt a retryable error still occurs, it will be written to the workflow log as "The request failed because something unexpected happened.".

### Service Errors ###

Service Errors are where a user's request can't be completed for operational reasons.  This includes validation errors, objects not being found, quotas being exceeded, etc.

The platform does not make any attempt to retry after a `ServiceError`, and these types of errors are not logged or monitored by the platform, only written to the workflow log.

If you run into an error, create a `ServiceError` object and return it as the error argument in your callback:

    cb(new sdk.Error.ServiceError('You must provide a value.'))

There might also be times where you'd like to include an error object along with your message for debugging purposes, although the error itself won't be shown to the user:

    cb(new sdk.Error.ServiceError('You must provide a value.', err))

Take care with the tone and style of your errors, as they'll be displayed directly to the user.

### Auth Errors ###

A special case is where the API returns an error relating to authorization (usually when a REST API returns a status code `401`).

Use an instance of `AuthError`, which is very similar to `ServiceError`.  If the service is authorized with OAuth 2.0, the platform will attempt to refresh the OAuth token and retry the request once.  If that doesn't succeed, the error will be written to the workflow log.

### Example ###

Here's a commonly used pattern for dealing with errors in a `request` callback.  In this case, our API broadly follows [REST](http://en.wikipedia.org/wiki/Representational_state_transfer) principles, and uses OAuth:

    request(options, function(err, response, body) {
      if (err) {
        done(err);
      } else if (response.statusCode === 401) {
        done(new sdk.Error.AuthError(body.errorMessage));
      } else if (response.statusCode >= 400 && response.statusCode < 500) {
        done(new sdk.Error.ServiceError(body.errorMessage));
      } else if (response.statusCode >= 300) {
        done(new Error(response.statusCode + ' ' + body));
      } else {
        /* Success! */
      }
    });

In practice, you'll probably want to wrap this logic up into an `errorHandler` function in `index.js`.  That's the case for all of the examples in the SDK.

Authorized Libraries
--------------------

Each service is manually reviewed before we make it available in Flow XO, and part of that process is making sure that only authorised libraries are used in your scripts.

We do this for security and stability reasons, and also so that we can help developers without having to learn a different library each time.

If you need a library that isn't on this list, please get in touch so we can review it.

### Authorized Libraries ###

- [Async.js](https://github.com/caolan/async) - Async utilities
- [Moment.js](http://momentjs.com/) - Parse, validate, manipulate and display dates
- [Request](https://github.com/request/request) - Simplified HTTP request client
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - XML to object conversion
- [validate.js](http://validatejs.org/) - Validating javascript objects (commonly the input data)
- [q](https://github.com/kriskowal/q) - Promise library
- [lodash](https://lodash.com/) - Javascript utility library

Updating a Method
-----------------

Once a method is made available, it can't be changed or deleted, only deprecated (and usually replaced with a newer version).

To deprecate a method, simply set `{ deprecated: true }` in the `config.js`.  You can then create a replacement method with a versioned slug `{ slug: 'a_method_v2' }` (it's OK to use the exact same `name` in your new version, only the `slug` needs to be unique).

Of course, you'll need to resubmit your service to us to have the changes made live.

Running Methods
===============

    grunt run

Will present you with a menu system where you can choose a method, select a script within that method, and then set some inputs. Once you've made your selections, the method will execute (using the auth credentials saved in your `credentials.json` file) and the output will be displayed on screen.

You'll then be given the option to update the inputs and run again. This functionality is particularly useful for testing a polling trigger, where you can run the script once, do something in your service, then run it again to check that your new record is found.

Testing
=======

Test Overview
-------------

Tests are stored in the `tests` folder at the root of the service. A test file has the `.spec.js` file prefix. By default some tests are scaffolded when the service is created, and when new methods are added. These tests will need to be updated by you as, untouched, they will fail.

The default layout is to have one test file per method and additionally one service-level test, but you are welcome to organise them as you wish (all `.spec.js` files under the `tests` folder will be picked up automatically whever they are located).

Tests are standard Node.js [mocha](http://mochajs.org/) tests. A supporting script `tests/bootstrap.js` is run before each execution of the tests, and makes a number of useful things accessible in your test scripts:
- `this.credentials` - the credentials being used in this test run. This is read from `credentials.json` in the root of your service
- `this.service` - the service under test (as if you had called `this.service = require('my-service');`)
- `this.runner` - an instance of a `ScriptRunner` which handles all the business of executing your script files. The `ScriptRunner` has one main function:
```
// Run a method script
runner.run(slug, script, options, callback);
// Run a service script e.g. ping.js
runner.run(script, options, callback);
```

- `slug` - the slug of the method to run.
- `script` - the script to run. If a method was provided this is a method script, either 'run', 'input' or 'output'. If no method was provided, this is a service level script. Currently there is only one service-level script, `ping`
- `options` - the options to be passed into the script.  Normally you would define `options.input` as the input parameters.
- `callback` - callback function expecting the arguments `err` and `output`.

Writing Tests
-------------

An example test file:
```
var sdk = require('flowxo-sdk');

describe('Get Person',function(){
  describe('Run Script',function(){
    it('should return error when no person_id is passed in',function(done){
      this.runner.run('get_person','run',{},function(err,output){
        expect(err).to.be.defined;
        expect(output).to.be.undefined;
        expect(err).to.be.instanceof(sdk.Error.ServiceError);
        done();
      });
    });
  });
});
```

Passing Data Into Tests
-----------------------

Sometimes you will need to pass data into your test suite in order for it to execute properly. This data may be dependent on your own personal credentials with a particular account in the service. For example if you have written a `get_person` test that requires to run against the real API, you'll need to provide both a set of credentials AND a valid `person_id` to the script in order for it to work. The credentials are handled by the test mechanism (`this.credentials is available which is read from your `credentials.json` file in the root of your service, which can be created by `grunt auth`).

To pass other transient data into the script, use a `.env` file in the root of your repository. This will be automatically picked up by `grunt test` and the values in it will be available in `process.env`. **NOTE** This `.env` file should not be stored under version control - the default `.gitignore` handles this.

An example `.env` file for the above case would be
```
PERSON_ID=af23f34
```

And then in the script this can be used as:
An example test file:
```
var sdk = require('flowxo-sdk');

describe('Get Person',function(){
  describe('Run Script',function(){
    it('should return error when no person_id is passed in',function(done){
      this.runner.run('get_person','run',{input:{person_id: process.env.PERSON_ID}},function(err,output){
      // ....
      });
    });
  });
});
```

**NOTE** If the setup of any data is required in order for your test suite to pass successfull, this should be clearly documented in the `README.md` file.

Test Approach
-------------

The test mechanism is designed for and encourages you to connect to your _real_ service in order to validate your service performs as expected. Whilst this is obviously a crucial part of testing, it can be slow if every single test case requires establishing a connection to a remote server. For example if your are testing part of your service that deals with formatting the APIs data to send back to the core, you probably don't need to call the real API every time - you know what the data is going to look like anyway.

One approach is to try and structure your service code into separate units that can be tested indepndently. For example if you pulled the code for formatting the response out of the `run.js` script and into a seperately callable function (perhaps on the service object itself `service.formatData()`) then you are albe to test this function *offline* with all the permutation and edge-cases you need, without having to call the API everytime.

Another way is to simple *mock* calls to the API. A good library for this is the [nock](https://github.com/pgte/nock) library. An example test case:
```
'use strict';
var nock = require('nock');

// Before each test, reset nock
beforeEach(nock.cleanAll);

describe('Get Person',function(){
  it('should throw authentication error on 401',function(done){
    // Setup our mocked 401 response
    var scope = nock('https://my.service.com')
                .get('/person/1')
                .reply(401);

    this.runner('get_person','run',{input:{person_id: 1}},function(err,output){
      expect(err).to.be.defined;
      expect(err).to.be.instanceof(sdk.Error.AuthError);
      expect(scope.isDone()).to.be.true;
    });
  });
});
```

Running Tests
-------------
Tests can be run with the task:

    grunt test

When tests are run, credentials are taken from the `credentials.json` file present in the root of your service folder (if present) and passed onto the service methods.

Recipes
=======

The FlowXO SDK and the services scaffolded by the FlowXO Generator try to be as non-opioniated as possible, not forcing you to take one approach over another. Below are some common _recipies_ you may find helpful in your code.

Input Validation
----------------
Where possible, we recommend that you leave detailed input validation up to the API you are dealing with - just send up the data you've got and see what response you get back. Hopefully if the service in question has decent error handling you'll get a good error message back which you can use directly.

However there can be times when some simple validation of the input will immediately reveal an error is going to occur before continuing. For example if you are writing a `get_person` method, and your `run.js` script is going to construct the following URL to query:
```
  var personUrl = 'https://my.service.com/persons' + options.person_id
```
Of `options.person_id` is `undefined`, or contains spaces, or isn't alphanumeric, we can immediately abort.

To perform this sort of validation, a good library to use is [validate.js](). This could be implemented in the following way:
```
###########################################################################
# in index.js of your service
###########################################################################
var validate = require('validate.js'); // npm install --save validate.js
                                       // to use this
var service = new sdk.Service({
  //...
});
//...

/**
 * Validate the data according to the constraints and return an
 * error suitable for sending back to the core, if required
 */
service.validate = function(data,constraints){
  var errors = validate(data,constraints,{flatten: true});
  if(errors){
    return new sdk.Error.ServiceError(errors.join('. '));
  }else{
    return undefined;
  }
}

###########################################################################
# in run.js of your method
###########################################################################
module.exports = function(options,done){
  // Input validation
  var inputErr = this.validate(options.input,{
    person_id: { presence: true, numericality: true }
  });

  if(inputErr){
    return done(inputErr);
  }

  // Else carry on safe in the knowledge options.person_id is
  // there and is a number
}
```
Submitting your Service
=======================

TODO: Needs work!

When your module is ready, you should publish your repo to [Bitbucket](https://bitbucket.org/) (you'll usually want to keep it private!) and open a pull request to our main [services](https://bitbucket.org/) repository on Bitbucket.

We'll then review your work, and all being well, make it live!
