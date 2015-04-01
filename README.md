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

That's all.  The other tools that the SDK calls on will be installed locally with the `npm install`.

Scaffolding Your Service
========================

You should start your service using our [Yeoman](http://yeoman.io/) generator. This can be installed using [npm](https://npmjs.org), but as the generator is not publicly available, you need to specify the github user and repo when installing:

    npm install flowxo/flowxo-generator

You should now be able to run `yo flowxo` to generate a service.

If you select a _Credentials_ service, you'll be asked to define the fields that the user must complete. Normally this would be a username, password, API key, token, account name, etc.  Just define all the fields you'll need to collect in order to access and authorize against your service's API.  See the _Authorization > Credentials_ section for more information.

If you select an _OAuth_ service, a skeleton `oauth.js` file will be created for you.  See the _Authorization > OAuth_ section for how to do this.

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

There's a few other files you might also have in your root, including `oauth.js`, `auth.json` and `.gitignore`.

Requiring the SDK
-----------------

    var sdk = require('flowxo-sdk');

The SDK exposes these functions:

- `Service`: The main service object, return an instance of this in `index.js`.
- `Error`: Contains a set of Flow XO error objects (see _Creating Methods > Handling Errors_).
- `Utils`: Utility functions, such as `Utils.polling`.

Scripts
-------

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

The `index.js` file at the root of your module defines the service name and its auth settings.  It looks something like this:

    var service = new sdk.Service({
      name: 'Your Service',
      slug: 'your_service',
      auth: {
        ...
      }
    });
    
    module.exports = service;

This script is also a place to hold your shared code.  It's common to create a function that abstracts the handling of HTTP requests, and perhaps a function that handles errors.

Take a look at the example modules to see what kind of code you should be centralising here.

ping.js
-------

The core sometimes needs to check whether it's able to connect to your service.  For example, after the user has provided their credentials to connect a new account, the core will call `ping.js` to check those credentials work.

You'll be passed an `options` object containing the credentials that the user supplied (in `options.credentials`), and should return either `true` or `false` as the output:

    module.exports = function(options, done) {
      /* Check the credentials */
      done(null, true);
    }

In this script, an authorization error returned by the API (such as `401 Unauthorized`) shouldn't be treated as an error, and instead you should set the output to `false`.  This differs from the other script types, where a `401` __should__ usually be considered an error.

Authorization
=============

Flow XO supports credential based auth (where the user provides some kind of secret that can be used for authorization) or the [OAuth](http://oauth.net/) protocol, where the user grants access directly through the service being accessed.

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

Flow XO relies on the [Passport](http://passportjs.org/) library.  You'll need to define some settings in `oauth.js` (the Passport 'Strategy').  The default file contains a skeleton with enough helper text to get you started. The basic task is to update the `strategy` property with your service's OAuth details (ID, secret, callback URL, etc.).  Passport has some documentation on [setting up OAuth](http://passportjs.org/guide/oauth/).

Once you have a valid `oauth.js` file, the service can be declared as OAuth in your `index.js`:

    auth: {
      type: 'oauth',
      params: { // Optionally declare any extra strategy params
        scope: ['read', 'write']
      }
    }

When your scripts are run, you'll get an `access_key` in `options.credentials`, which you can use wherever the API expects an OAuth token.

You'll also need to take special care to use an _OAuth Error_ when the API reports an authorization problem.  That way, the core knows to try and refresh the access token and try your script again (when possible).  See the section _Handling Errors > OAuth Errors_ for details.

Local Testing
-------------

The SDK contains a Grunt task:

    grunt auth

This will take you through generating a set of auth credentials that you can use locally to test your scripts.

- If your service uses credentials, you'll simply be asked to complete the required fields e.g. API Key.
- If you're using OAuth, a browser window will open asking you to authorize.

Credentials are stored in an `auth.json` in the root of your service.  Of course, this file should **not** be committed to version control.  The default `.gitignore` takes care of this.

Creating Methods
================

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

You'll be passed an `options` object and `done` (a callback).  The script should do its work and either call `done(err)` or `done(null, output)`.

    module.exports = function(options, done) {
      /* Do some stuff */
      done(null, [Object]);
    }

The `options` object contains the auth credentials and the input values (plus a `scriptStore` function that you'll only need when using `sdk.Utils.polling`):

    {
      credentials: {
        /* auth credentials */
      },
      input: {
        /* input values */
      },
      scriptStore: [Function] /* For use with sdk.Utils.polling */
    }

The `output` object should be the data returned by the method:

    {
      key: 'Some Value',
      another_key: 'Another value'
    }

All the keys that your script might output should be included in the output fields described in the method's `config.js` (or `output.js`).

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
2. Pass the array of items to `sdk.Utils.polling()`, along with a string referencing the property that holds the unique ID for each item in the list, `options.scriptStore` and finally a callback.
3. Your callback will be passed an array of new items (or an empty array), which can then be processed further and passed back as the result.

You can define your method as a polling trigger in `config.js`:

    var config = {
      name: 'A Polling Trigger',
      slug: 'a_polling_trigger',
      type: 'poller',
      kind: 'trigger',
      ...
    }

The `Utils.polling` function inside the SDK will take care of a lot of the work:

    sdk.Utils.polling(data, key, scriptStore, callback);

All you need to do is give it a list and tell it what property within each list item holds the ID. A callback is fired with an array of new items.

- `data` (Array) - An array that is to be checked for new items.  This will often come directly from an API, but you may need to pick out the property containing the list of items.
- `key` (String) - The property that holds the unique ID for each item in the list.  For example, on Twitter's `timelines.user` endpoint, each tweet that's returned contains an `id_str` property which is the unique ID for the tweet. In this case, set the key to `id_str`.  You can use double underscore notation here to reference a nested key (such as `meta__ids__id`).
- `scriptStore` (Function) - Always expects the `options.scriptStore` function passed into the script.
- `callback(err, items)` - The callback function is called with either an error, or if successful, an array containing the new items found (those with a key that hasn't been seen before).  The array might be empty if no new items are found.

Internally, the function asks the `scriptStore` whether each key has been seen before, and if not, adds it to the array of items it returns.  The core will then update the cache of items once it's handed the list of new items.

To see polling triggers in action, study the examples included in the SDK.

TODO: Did Joe implement support for underscore notation for the `key` value?

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

This is the default error type.  If you return a standard error object (not from `sdk.Error`), it will be treated as a `RetryableServiceError`.

When you encounter a retryable error, create an instance of the `RetryableServiceError` object and return it as the error argument in your callback.

The `RetryableServiceError` expects an object containing any debug information you think is relevant.  It might include:

- An error object `err`.
- The HTTP status code received `status`.
- The response body of the HTTP request `body`.

For example:

    cb(new sdk.Error.RetryableServiceError({ err: [object] }))
    cb(new sdk.Error.RetryableServiceError({ status: 504, body: "Gateway Timeout" }))
    cb(new sdk.Error.RetryableServiceError({ err: [object], status: 500, body: "Server Error" }))
    cb(new sdk.Error.RetryableServiceError({ err: [object], foo: "bar" }))

Always provide as much information as you can (for debug purposes).  You should use a `RetryableServiceError` in situations like these:

- HTTP requests fail.  For example, where you use `request.post()` to call the API and your callback receives an error object.  Pass the error object directly into `RetryableServiceError`.  No need to send a status code or body, as the HTTP request failed.
- Where you receive a 500 status code from the API, and you were expecting 200.  Pass the status code and body you receive into the error object.
- If you receive a 200 status code (as expected) and test for the presence of a `result` JSON key in the body, but find that it's not there, then pass the status and body into the error.
- A `JSON.parse` of the API's response throws an error.  Pass in the caught error from `JSON.parse` along with the status and body from the API.

The platform will retry the request up to 5 times (with exponential back-off), and if after the 5th attempt a retryable error still occurs, it will be written to the workflow log as "The request failed because something unexpected happened.".

Retryable errors are logged and monitored by the platform.

### Service Errors ###

ServiceErrors are where a request to the API succeeded (in technical terms) but the user's request can't be completed for operational reasons.  They include authorisation problems (except OAuth, see below), validation errors and quotas being exceeded.

The platform does not make any attempt to retry after a `ServiceError`, and these types of errors are not logged or monitored by the platform, only written to the workflow log.

If you run into an error, create a `ServiceError` object and return it as the error argument in your callback:

    cb(new sdk.Error.ServiceError("You must provide a value."))

Take care with the tone and style of your errors, as they'll be displayed directly to the user.  You should follow our style guide.

For common/recognised errors, it's normally best to extract the error message and create your own error object from the original message.  The objective here is to present a friendly, useful and readable message to user.  To help with this, you can create a `ServiceError` object with a friendlier message and the original error like so:

    cb(new sdk.Error.ServiceError({ err: [object], message: "Please provide a value." }))

Make sure you include a `message` or the message from `err` will be used instead.

### OAuth Errors ###

A special case is where the API returns an error relating to the OAuth token.

Use an instance of `AuthServiceError`, which works the same as `ServiceError`.  The platform will attempt to refresh the OAuth token and retry the request once.  If that doesn't succeed, the error will be written to the workflow log.

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

Updating a Method
-----------------

Once a method is made available, it can't be changed or deleted, only deprecated (and usually replaced with a newer version).

To deprecate a method, simply set `{ deprecated: true }` in the `config.js`.  You can then create a replacement method with a versioned slug `{ slug: 'a_method_v2' }` (it's OK to use the exact same `name` in your new version, only the `slug` needs to be unique).

Of course, you'll need to resubmit your service to us to have the changes made live.

Running Methods
===============

    grunt run

Will present you with a menu system where you can choose a method, select a script within that method, and then set some inputs. Once you've made your selections, the method will execute (using the auth credentials saved in your `auth.json` file) and the output will be displayed on screen.

You'll then be given the option to update the inputs and run again. This functionality is particularly useful for testing a polling trigger, where you can run the script once, do something in your service, then run it again to check that your new record is found.

Writing Tests
=============

Tests can be run with the task:

    grunt test

When tests are run, credentials are taken from the `auth.json` file present in the root of your service folder (if present) and passed onto the service methods.

Tests are standard Node.js [mocha](http://mochajs.org/) tests. Some important global variables are available in your test scripts:

- `service` - the main/shared functions for your service (in `index.js`).
- `runner` - an instance of `ScriptRunner` which allows you to easily run your methods. The `ScriptRunner` has one main function:

```
runner.run(slug, script, options, callback)
```

- `slug` - the slug of the method to run.
- `script` - the script to run, either 'run', 'input' or 'output'.
- `options` - the options to be passed into the script.  Normally you would define `options.input` as the input parameters.
- `callback` - callback function expecting the arguments `err` and `output`.

### Request Replay ###

By default, tests are run live, connecting to real API's and making real requests. Whilst this is obviously an important part of the test process, there can be times when this can make testing slow.

    REPLAY=record grunt test

Running in this mode will use [Node Replay](https://github.com/assaf/node-replay).  This module monitors all inbound and outbound HTTP requests made by a Node.js process.

In `record` mode, it will record any requests it hasn't seen before (these get stored in the `tests/fixtures` folder of your service). In future test runs where a request is recognised, Node Replay returns the cached response instead of calling the real API. See [Node Replay](https://github.com/assaf/node-replay) for more information.

Submitting your Service
=======================

TODO: Needs work!

When your module is ready, you should publish your repo to [Bitbucket](https://bitbucket.org/) (you'll usually want to keep it private!) and open a pull request to our main [services](https://bitbucket.org/) repository on Bitbucket.

We'll then review your work, and all being well, make it live!
