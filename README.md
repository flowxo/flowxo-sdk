# Flow XO SDK

An SDK to build services for the Flow XO platform.

[![Build Status](https://travis-ci.org/flowxo/flowxo-sdk.svg?branch=master)](https://travis-ci.org/flowxo/flowxo-sdk)
[![npm version](https://badge.fury.io/js/flowxo-sdk.svg)](http://badge.fury.io/js/flowxo-sdk)
[![Dependency Status](https://david-dm.org/flowxo/flowxo-sdk.svg)](https://david-dm.org/flowxo/flowxo-sdk)
[![devDependency Status](https://david-dm.org/flowxo/flowxo-sdk/dev-status.svg)](https://david-dm.org/flowxo/flowxo-sdk#info=devDependencies)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Scaffolding Your Service](#scaffolding-your-service)
- [Code Structure](#code-structure)
- [Requiring the SDK](#requiring-the-sdk)
- [Scripts](#scripts)
- [Service Index](#service-index)
- [Authorization](#authorization)
  - [Credentials](#credentials)
    - [ping.js](#pingjs)
  - [OAuth](#oauth)
- [Creating Methods](#creating-methods)
  - [Method Ordering](#method-ordering)
  - [config.js](#configjs)
  - [Input Fields](#input-fields)
    - [Text Areas](#text-areas)
    - [Select Boxes](#select-boxes)
    - [Date/Time Fields](#datetime-fields)
    - [Boolean Fields](#boolean-fields)
    - [Dictionary Fields](#dictionary-fields)
  - [Output Fields](#output-fields)
    - [Double Underscore Notation](#double-underscore-notation)
  - [input.js](#inputjs)
    - [Dependant Fields](#dependant-fields)
  - [output.js](#outputjs)
  - [run.js](#runjs)
  - [Polling](#polling)
  - [Webhooks](#webhooks)
    - [Fields](#fields)
    - [Handling The Webhook](#handling-the-webhook)
      - [Help Instructions](#help-instructions)
  - [Input Validation](#input-validation)
    - [Validating Flow XO Datetime and Boolean Fields](#validating-flow-xo-datetime-and-boolean-fields)
    - [Validating String Fields containing Dates](#validating-string-fields-containing-dates)
  - [Handling Errors](#handling-errors)
    - [Retryable Errors](#retryable-errors)
    - [Service Errors](#service-errors)
    - [Auth Errors](#auth-errors)
- [Help Docs](#help-docs)
- [Testing and Environment](#testing-and-environment)
  - [Setup](#setup)
  - [Authentication](#authentication)
    - [Basic Credentials](#basic-credentials)
    - [OAuth](#oauth-1)
      - [Callback URL for development](#callback-url-for-development)
  - [Running Tests](#running-tests)
  - [Recording Tests](#recording-tests)
  - [Test Documentation](#test-documentation)
  - [Testing Pollers](#testing-pollers)
- [Examples](#examples)
  - [Example Services](#example-services)
  - [Code Sample Index](#code-sample-index)
- [Authorized Libraries](#authorized-libraries)
- [Updating a Method](#updating-a-method)
- [Submitting Your Service](#submitting-your-service)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

[Flow XO](https://flowxo.com) is a platform that lets users build automated workflows on top of their existing cloud apps.

Each supported service is built as a _module_ which is called by the Flow XO _core_. A service is split into separate _methods_, and each method is either a _trigger_ (looks for new records, or receives new records via a webhook) or an _action_ (creates, updates or deletes records).

We've opened up our SDK so that anyone can build support for their service into Flow XO. The SDK gives you scaffolding for your service, a command-line tool to run your methods locally, tools to write integration tests and some examples of working services. Not forgetting these docs which should hopefully guide you through the process.

If you get stuck, just send us an email at [support@flowxo.com](mailto:support@flowxo.com) and we'll try our best to guide you.

## Prerequisites

Flow XO runs on [Node.js](https://nodejs.org/). If you don't have Node.js, you can [download it here](https://nodejs.org/download/). We'd prefer you to use v4.x as this is what we use in production, but v0.12.x will also work fine. Note that we haven't tested the SDK on Windows, and so it may not work correctly for this OS.

You'll also need to be familiar with [Git](http://git-scm.com/) as you'll be using it to submit your service for review. We use [GitHub](http://github.com) to host the services code, and you'll need to be familiar with forking and creating pull requests, as this is the workflow we will be using to validate your service.

As most modules will be fairly thin wrappers around HTTP API's, you should understand how to make HTTP requests in Node. We encourage you to use the popular [Request](https://github.com/request/request) module, but you can choose to make requests with Node's plain [https](https://nodejs.org/api/https.html) API if you prefer.

Finally, build and test related tasks are handled by the JavaScript task runner [Grunt](http://gruntjs.com/) so a working knowledge of this is useful.

That's all. The other tools that the SDK uses will be installed locally with `npm install`.

## Scaffolding Your Service

To make it easy to build your service, we've written a [Yeoman](http://yeoman.io/) generator, which complements this SDK. You should install and use this to scaffold your service:

``` bash
npm install -g yo generator-flowxo
```

You should now be able to run `yo flowxo` to generate a service.

If you select credentials authorization, you'll be asked to define the fields that the user must complete. Normally this would be a username, password, API key, token, account name, etc. Just define all the fields you'll need to collect in order to access and authorize against your service's API. See the _Authorization > Credentials_ section for more information.

If you select OAuth, some skeleton configuration will be created that will need to be updated later. See the _Authorization > OAuth_ section for how to do this.

You should now have a populated directory with some scripts. Next, we'll take a look at what we've generated.

## Code Structure

A service is a collection of JavaScript files, with scripts relating to the service as a whole in `/lib`, and a directory for each method beneath that in `/methods`.

This is how your service will eventually be structured (although you won't have any methods yet):

```
service_name
  |-- lib/ - contains service implementation
    |-- index.js - describes the service & authorization fields, and holds shared functions
    |-- ping.js - the core runs this to check authorization
    |-- methods/
      |-- method_name/
        |-- config.js - describes the method & input/output fields
        |-- run.js - the core calls this script to run the method
        |-- input.js - optional, returns custom input fields
        |-- output.js - optional, returns custom output fields
      |-- another_method/
        |-- ...
  |-- runs/  - created when integration test runs are recorded
```

The service expects files to remain in their default locations, so try not to move things around unless you know what you are doing.

## Requiring the SDK

``` js
var sdk = require('flowxo-sdk');
```

The SDK exposes these public properties:

- `Service`: The main service object, return an instance of this in `index.js`.
- `Error`: Contains a set of Flow XO error objects (see _Handling Errors_).

You'll only be concerned with the public properties when building your service.

## Scripts

A Flow XO service is built up of some configuration plus a number of _scripts_. `ping.js`, `run.js`, `input.js` and `output.js` all work in a similar way.

They're passed an `options` object along with a callback function `done`, which is a standard node.js ['error-first' callback](http://thenodeway.io/posts/understanding-error-first-callbacks/) function.

``` js
module.exports = function(options, done) {
  /* Do something here */
  done(err, output);
}
```

Your script receives the input and does whatever work is necessary. If all is well, the script should call `done(null, object)`. If there's a problem, tell the core about it by returning `done(err)` (see the section on _Handling Errors_).

**Important:** There's no shared state between scripts.  Every script should be capable of running independently and relying only on the `options` object for its input.  In production, every script is run in its own context.

Each type of script will be explained in more detail later.

## Service Index

The `lib/index.js` file defines the service. It looks something like this:

``` js
var service = new sdk.Service({
  serviceRoot: __dirname,
  name: 'Your Service',
  slug: 'your_service',
  auth: {
    ...
  }
});

module.exports = service;
```

The Flow XO core will `require` your service like any other node module. Our module exports only one thing - an instance of the `sdk.Service` object configured for our service.

This `index.js` file is also a great place to hold or link to your shared code, by attaching it to the `Service` object. That's because when your scripts execute, they are executed as if they were methods of the service object itself.

In the example above you'll see two important fields for defining the service. The `name` field is how the service will be presented to the user in the UI. The `slug` field is used internally by the Flow XO core, and should be a lowercase underscore-delimited string uniquely representing your service. Normally you should not need to change these generated values.

It's common to create a module that abstracts the handling of HTTP requests, and perhaps a function that handles errors. See _Input Validation_ for an example of creating a common `service.validate` function that you can use throughout your scripts.

Take a look at the example modules to see what kind of code you should be centralising here.

## Authorization

Flow XO supports credential based auth (where the user provides some kind of secret that can be used for authorization) or the [OAuth](http://oauth.net/) protocol, where the user grants access directly through the service being accessed. Both OAuth 1 and OAuth 2 are supported.

### Credentials

We support authorization with credentials (an API key, token, username/password or actually any combination of fields) which are passed into your scripts at runtime and can then be used to authorize requests.

Usually that means sending credentials in the request headers or query string, or perhaps exchanging the credentials for a token before using that in requests.

To configure credentials based auth, you'll be asked to add one or more fields by the generator when initially scaffolding your service. If you need to edit these fields later on, you'll need to edit the `auth` property in the `lib/index.js` file.

For example, if you need to collect 2 fields, an API key and an account name, you should declare those fields like this:

``` js
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
```

See the section _Input Fields_ for a list of the field types you can use here.

When your scripts are run, you'll get the credentials in `options.credentials`.

#### ping.js

A `credentials` service will be scaffolded with a `lib/ping.js` script, which needs to be implemented to check that the details provided by the user are valid. After the user has provided their credentials to connect to a new account, the core will call `ping.js` to check those credentials work.

You'll be passed an `options` object containing the credentials that the user supplied (in `options.credentials`), and like the other scripts you should either call `done()` to indicate success or `done(err)` to indicate error:

``` js
module.exports = function(options, done) {
  // Make some API call
  this.client.getUser(options.credentials, function(err) {
    if(err) {
      // We have a problem - return the error.
      return done(err);
    }

    // Otherwise, all is ok.
    return done();
  });
}
```

### OAuth

Most external APIs now support authentication using OAuth and typically offer OAuth 2. This is the preferred method of authentication so you should always investigate if OAuth 2 is supported by the API you are working with.

We support [OAuth](http://oauth.net/) (versions [1.0a](http://oauth.net/core/1.0a/) and [2.0](http://oauth.net/2/)).

If there's a choice between credentials and OAuth, it's usually better to use OAuth, as instead of copying and pasting credentials, the user will be prompted with a browser window, asking for their username/password for the connecting service.

Flow XO relies on the [Passport](http://passportjs.org/) library for managing OAuth 1 and OAuth 2 authentication. If you have created an OAuth service, the generated `lib/index.js` file contains a skeleton auth configuration with enough helper text to get you started. You should update the `strategy` property with a valid Passport strategy (remember to install it first with `npm install --save`), and configure the options (`consumerKey`/`consumerSecret` for OAuth 1, `clientID`/`clientSecret` for OAuth 2) and params (scope, state, etc) that you need.

Twitter uses OAuth 1, and so an example for a Twitter service might look like:

``` js
auth: {
  type: 'oauth1',
  strategy: require('passport-twitter').Strategy, // npm install --save passport-twitter
  options: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET
  }
}
```

Facebook uses OAuth 2, and so an example for a Facebook service might look like:

``` js
auth: {
  type: 'oauth2',
  strategy: require('passport-facebook').Strategy,
  options: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    state: true,       // Prevent CSRF
    enableProof: true  // Support Graph API appsecret_proof
  },
  params: {
    scope: ['email','user_likes']
  }
}
```

Make sure that if the strategy requires any extra configuration, you add it to either the `options` or the `params` object. Refer to the strategy's documentation for more details on this.

_Note: you do not need to add a `callbackURL` to the options object, as the system will automatically generate a callbackURL for you. When testing the service, you'll need to setup your development machine so that the generated callback URL can be reached by the test runner. See the section Testing and Environment > Authentication for more details._

You'll notice the use of [environment variables](https://nodejs.org/api/process.html#process_process_env) to prevent the hard coding of the key and secret. When configuring the service, we'll provide you with these details for connecting to the service, and you should enter the details into the `.env` file for integration testing purposes. For more details on setting environment variables, refer to the section _Testing and Environment > Authentication_.

When your scripts are run, you'll get the relevant credentials in the `options.credentials` object:

``` js
// OAuth 1
{
  credentials: {
    consumer_key: '<consumer_key>',
    consumer_secret: '<consumer_secret>',
    token: '<token>',
    token_secret: '<token_secret>'
  }
}

// OAuth 2
{
  credentials: {
    access_token: '<access_token>',
    refresh_token: '<refresh_token>'
  }
}
```

The credentials object for OAuth 1 matches the structure expected by the [request](https://github.com/request/request#oauth-signing) library, which means you can pass `options.credentials` straight into the request options:

``` js
var options = {
  url: 'http://example.com',
  oauth: options.credentials
}

request(options, done);
```

You'll need to take special care to use an _Auth Error_ when the API reports an authorization problem. That way, if the service is an OAuth 2 service, the core knows to try and refresh the access token and try your script again (when possible). See the section _Handling Errors > Auth Errors_ for details.

## Creating Methods

The [Flow XO Generator](https://github.com/flowxo/generator-flowxo) contains a generator to scaffold individual methods as well as entire services. Simply run `yo flowxo:method` and follow the steps to generate a new method.

Methods are stored in the `lib/methods/` folder. Each method has its own folder with the name being the `slug` of the method. Inside each method folder you'll find `config.js`, `run.js`, and if you selected these during the scaffold, `input.js` and/or `output.js`.

### Method Ordering

By default, the SDK will load all methods contained in the `lib/methods/` folder. The order in which they are loaded is nondeterministic, that is, cannot be guaranteed.

If you'd prefer the methods to be ordered in a particular way, you should add a `methods` property to the service's `config.js`. This property should contain an array of method slugs, in the order that you'd like the methods to be presented.

For example:

``` js
var service = new sdk.Service({
  serviceRoot: __dirname,
  name: 'Your Service',
  slug: 'your_service',
  methods: [
    'create_document',
    'add_document',
    'update_document',
    'delete_document'
  ]
});

module.exports = service;
```

Make sure you include all of your methods in this array, as any that are not defined will not be made available for use.

### config.js

Each method has its own `config.js` file, which defines the method's name, what type of method it is, and describes its input/output fields.

A typical config file looks like this:

``` js
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
```

- `type` - Accepts values of `poller` (see the section _Polling_), `webhook` (see the section _Webhooks_) or `action` (anything else).
- `kind` - Defines the method as either a `trigger` or `task`.
  - A `trigger` is a method which responds to changes in the connected service. If any new items were found, this triggers a workflow.
  - A `task` is a method which carries out an action during a workflow request. This could be creating a new record, updating an existing one, or fetching data.
- `scripts` - All methods should have a `run` script. You can reference an `input` and/or an `output` script too. Use input/output scripts to dynamically define fields that are generated at runtime and show alongside the static fields you define in the `fields` property. See the _input.js_ and _output.js_ sections for more details.
- `fields` - Contains `input` and `output` objects, defining arrays of fields that will be available for input to the script, and the properties that your script will output (on success). See the sections on _Input Fields_ and _Output Fields_ below.

### Input Fields

Input fields should be provided as an array of objects that describe what type of data the input field accepts and how it is to behave in the UI.

The most basic input field is `text`, which will be displayed to the user as a single-line `input` box.

``` js
{
  key: 'first_name',
  label: 'First Name',
  type: 'text'
}
```

Ensure that the `key` for each object in the method config is unique, including keys generated by the `input.js` script. The following is invalid:

``` js
[{
  key: 'duplicated',
  label: 'Duplicated Key',
  type: 'text'
}, {
  key: 'duplicated',
  label: 'Duplicated Key',
  type: 'text'
}]
```

You can make any field required:

``` js
{
  key: 'first_name',
  label: 'First Name',
  type: 'text',
  required: true
}
```

Note that the UI will ensure there's some kind of value in a required field, but that might be a property from another task and be empty, so you'll still need to check for empty fields within your script.

Fields can also have a default value:

``` js
{
  key: 'first_name',
  label: 'First Name',
  type: 'text',
  required: true,
  default: 'John'
}
```

It's also helpful to provide some extra description to help the user understand how to use the field. Do that with a `description`:

``` js
{
  key: 'first_name',
  label: 'First Name',
  type: 'text',
  required: true,
  default: 'John',
  description: 'You know what this is, right?'
}
```

The description is displayed underneath the field.

You can also use text areas, select boxes, special date/time fields and boolean fields.

#### Text Areas

``` js
{
  key: 'description',
  label: 'Description',
  type: 'textarea'
}
```

#### Select Boxes

``` js
{
  key: 'priority',
  label: 'Priority',
  type: 'select',
  default: '1',
  input_options: [
    {
      label: 'Low',
      value: '1'
    },
    {
      label: 'Medium',
      value: '2'
    }
  ]
}
```

The `label` and `value` for each input option should be a __non-empty string__.

Notice that the `default` field references the `value` of the matching `input_options`. So, in the example above, the select box will show the 'Low' item by default.

Users can still provide an output or text instead of selecting a value (they have an option in the UI to switch the select box into a text field), so it's important to validate properly, or at least make sure the API handles the validation.  Select boxes that have dependant fields are *not* editable.

#### Date/Time Fields

``` js
{
  key: 'due',
  label: 'Due Date',
  type: 'datetime'
}
```

You can learn more about date/time fields in our [knowledge base](http://support.flowxo.com/article/9-dates-times). The field attempts to coerce any value into a [JavaScript Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), which can then be [converted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) to an [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) string. It makes it easy for users to exchange dates between services.

The value of a date/time field will always be passed into your script as an object after being processed by the core:

``` js
{
  type: 'date',
  input: 'tomorrow',
  valid: true,
  parsed: Date
}
```

You'll find the original value in `input`, a flag to say whether the date is `valid`, and `parsed` which will contain a valid date object, or an [Invalid Date].

To stringify the date into ISO 8601 format, you can use the [toISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) method on the date object:

``` js
var isoStr = date.parsed.toISOString();
```

The `date` object is automatically enhanced with the [sugar.js library](http://sugarjs.com). You are free to use the [Sugar Date API](http://sugarjs.com/dates) on your parsed dates. Everything apart from [ranges](http://sugarjs.com/dates#ranges) is supported.

For example, if you wanted to output a date object in a particular string format:

``` js
var formattedStr = date.parsed.format('{yyyy}-{MM}-{dd}');
// -> 2015-04-14

```

_Note: by default, sugar.js also enhances other JavaScript objects, such as `Number`, `String` and `Array`. Flow XO uses a [customised version](https://github.com/fiznool/sugar-date) of sugar.js which only enhances the `Date` prototype._

#### Boolean Fields

``` js
{
  key: 'active',
  label: 'Active',
  type: 'boolean',
  input_options: [ // Optional
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ]
}
```

If you don't specify `input_options`, the options will default to _Yes_ and _No_.

Users can provide an output or text instead of selecting a value (they have an option in the UI to switch the select box into a text field).

A boolean field type will attempt to coerce a select box value into `true` or `false`. It can handle the values `true`, `false`, `yes`, `no`, `1` or `0`.

It's similar to date/time in that the value passed to your script will always be an object:

``` js
{
  type: 'boolean',
  input: 'yes',
  valid: true,
  parsed: true
}
```

You'll find the original value in `input`, a flag to say whether the boolean is `valid`, and `parsed` which will either contain `null`, `true` or `false`.

#### Dictionary Fields

``` js
{
  key: 'metadata',
  label: 'Metadata',
  type: 'dictionary'
}
```

A dictionary field helps the user to define key/value pairs, a dictionary 'object'.  In Flow XO, the user constructs the object through a dictionary UI control.  In the SDK (when using `grunt run`), you'll need to use `key=val&key2=val2` format, escaping `\=` and `\&` where necessary.

The value passed to your script will always be an object:

``` js
{
  key: 'val',
  key2: 'val2'
}
```

It's important to note that whilst the user will be able to define duplicate keys, when the object is passed into the script, **keys will be unique**.  We take the *first* value we find for a key if it's defined more than once.

Empty values are allowed and so your script should be able to deal with that.  Empty keys are filtered out before they reach your script.

Setting this field type to `required` ensures that the user provides at least one key, however this key could be an output value from a previous task and ultimately could be empty, so you might still receive an empty object.  It should only be used to coerce the user, not to validate input.

### Output Fields

Output fields should be provided as an array of objects that describe what data the script will output (its output 'properties').

Each property is described like so:

``` js
{
  key: 'email',
  label: 'Email Address'
}
```

Similar to input fields, output `key`s should be unique, including keys generated by the `output.js` script.  You should describe all properties that your script _might_ output.

If a script outputs nested data, you should describe your keys using 'double underscore notation':

So an object that looks like this:

```
  {
    user: {
      id: '123',
      name: 'jane'
    }
  }
```

Would be represented as this:

``` js
{
  user__id: 'User ID',
  user__name: 'User Name'
}
```

Note that the SDK will take care of flattening and unflattening the actual data, so you do not need to worry about implementing this.

Remember that you only need to define the output fields that you want to make available. The JSON objects that you return from your client API calls may include more properties that you are outputting. In this case, the extra properties are ignored.

Some APIs that you deal with may have nested arrays of data like this:

```
  something: {
    id: '11213',
    items: [
      { name: 'bob' },
      { name: 'jane' } ...
    ]
  }
```

You will not know in advance how many array items there will be in the output data, so you should typically support up to 3:

```
    {
      key: 'items__0__name',
      label: 'Name 1'
    },
    {
      key: 'items__1__name',
      label: 'Name 2'
    },
    {
      key: 'items__2__name',
      label: 'Name 3'
    }
```

Simply refer to your nested data using the double underscore notation, and the SDK will take care of the rest. See the section _Double Underscore Notation_ for more details.

#### Double Underscore Notation

Output data in Flow XO can be referenced in your output fields using _double underscore notation_.  For example, take this data returned from an API:

``` js
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
```

This object's data can be referenced using these keys:

``` js
{
  name: 'My deal',
  people__0__name: 'John Doe',
  people__0__phone: '0207 000 0000',
  people__0__email: 'john.doe@example.com',
  people__1__name: 'Jane Doe',
  people__1__phone: '0208 000 0000',
  people__1__email: 'jane.doe@example.com',
  people__2__name: 'Jim Smith',
  people__2__phone: '0800 000 0000',
  people__2__email: 'jim.smith@example.com',
  meta__status: 'Open',
  meta__assigned: true
}
```

So to include output fields for _Deal Name_ and _Deal Person_ in your method's `config.js` or `output.js`, you would use:

```
[{
  key: 'name',
  label: 'Deal Name'
},
{
  key: 'people__0__name',
  label: 'Deal Person'
}]
```

You'll see that arrays are indexed from 0 - so `people__0__name` refers to the `name` property in the first item of the `people` array. Some APIs may return an arbitrary number of items in an array, but the config only supports addressing a fixed amount. Enter as many indexes as is reasonable for the particular service you are developing.

_Note: when implementing your scripts, expect and return data in regular 'nested' form, i.e. don't worry about flattening or unflattening data. The double underscore notation is only used for the output configuration._

### input.js

Sometimes it's necessary to generate fields at runtime (custom input fields). As an example, if our method has an input _User_, then it's usually best to load up a list of users into a select box rather than expect a user ID. We won't know who those users are until the account has been authorized, and that list might change from time to time.

So the way forward is to use an `input.js` script. The script is very similar to `run.js`, except it either returns an error, or an array of input fields on success. See the section _Input Fields_ for the format of the array you should return.

#### Dependant Fields

A dependant field is an input field whose range of values is dependant on the value selected in another input field.

For example, imagine you have 2 input fields, _Football League_ and _Football Team_. You want the user to select a League and then choose a Team from that League, but you cannot determine the list of teams to present to the user, until the user has actually chosen a particular league.

To signal that a field has dependencies, include the `dependants` property:

``` js
{
  key: 'league',
  label: 'League',
  type: 'select',
  input_options: [
    { value: 'prem', label: 'Premier League' },
    { value: 'champ', label: 'Championship' }
  ],
  dependants: true
}
```

When a value is selected in a field that has a dependancy, `input.js` is called. You'll know that `input.js` is being run to load a dependant field by the presence of a `target` property in the input data. If `target` is present:

- check the `target` property to determine the field that changed
- use the `fields` property to get the value of the `target` field. `fields` will contain all input fields collected so far

Combine this information to load the dependant field(s).

_Note: when calculating and returning a dependant field, don't return any other custom fields. The core will take care of merging the newly configured dependant field with the rest of the input fields._

Here is an example of loading a dependant field.

``` js
// config.js
// The static `league` field is marked as having dependant fields.
...
fields: {
  input: []
}
...

// input.js
'use strict';

module.exports = function(options, done) {
  options.input = options.input || {};
  var target = options.input.target;
  var fields = options.input.fields;
  if(!target) {
    // Since we have no `target`, we know this is an initial load.
    // Return the league field only.
    // Note that we could also define this field in `config.js`.
    return done(null, [{
      key: 'league',
      label: 'League',
      type: 'select',
      input_options: [
        { value: 'prem', label: 'Premier League' },
        { value: 'champ', label: 'Championship' }
      ],
      dependants: true  // Mark as having a dependant field
    }])
  }

  // Otherwise, we know this file was loaded as a result
  // of a field's value changing.
  // The input object will resemble:
  // {
  //   target: 'league',
  //   fields: {
  //     league: 'prem'
  //   }
  // }
  if(target === 'league') {
    // It was the league field that changed value.
    // Fetch the teams associated with this league,
    // and return these teams.
    var league = fields[target];
    var teamOptions = [];

    // In real life, we'd likely now hit an API
    // to fetch the teamOptions, but here just
    // fill in with dummy data.
    if(league === 'prem') {
      teamOptions = [{
        label: 'Chelsea',
        value: 'chelsea'
      }, {
        label: 'Manchester United',
        value: 'man-utd'
      }];

    } else if (league === 'champ') {
      teamOptions = [{
        label: 'Bristol City',
        value: 'bristol-city'
      }, {
        label: 'Nottingham Forest',
        value: 'notts-forest'
      }];
    }

    // Return the `team` field only.
    // Note that `league` is NOT returned here.
    done(null, [{
      key: 'team',
      label: 'Team',
      description: 'Select the team.',
      required: true,
      type: 'select',
      input_options: teamOptions
    }]);

  } else {
    // We didn't recognise the field that changed.
    // Return no fields.
    done(null, []);
  }
};

```

Notice that the script either returns the `league` OR `team` field, never both.

### output.js

`output.js` (custom output field) scripts are executed at runtime and augment the static output fields defined in the `config.js`.

Use an output script where the service supports 'custom fields'. For example, many [CRMs](http://en.wikipedia.org/wiki/Customer_relationship_management) allow administrators to define extra data fields alongside standard fields such as name, phone, etc.

The script is very similar to `run.js`, except it either returns an error, or an array of output fields on success. See the section _Output Fields_ for the format of the array you should return.

Note that `options.input` will hold the input values that the user has given to the method. Any `{{outputs}}` from other tasks in those values will be replaced with empty strings.

### run.js

This is the primary script of the method. Like every other script, you'll be passed an `options` object and `done` (a callback). The script should do its work and either call `done(err)` or `done(null, output)`.

``` js
module.exports = function(options, done) {
  /* Do some stuff */
  done(null, [Object]);
}
```

The `options` object contains the following properties:

``` js
{
  credentials: {
    /* auth credentials */
  },
  input: {
    /* input values */
  },
  logger: {
    /* winston.js logger */
  }
  // triggers only....
  poller: [Function]
}
```

The `output` object should be the data returned by the method.

For pollers, return an array of objects - each object will be classed as one new piece of data, and will trigger a request.

``` js
// poller output
[{
  id: 1,
  key: 'Some Value'
}, {
  id: 2,
  key: 'Some Other Value'
}]
```

In the example above, 2 objects have been returned, and so this will trigger 2 workflow requests, one for each object.

For actions, return a single object of data.

``` js
// action output
{
  key: 'Some Value',
  some: {
    nested: 'data'
  }
}
```

All the keys that your script might output should be included in the output fields described in the method's `config.js` (or `output.js`). Remember that nested data should be described using double underscore notation, e.g. `some__nested` (for the object above).

### Polling

Flow XO supports 2 trigger mechanisms: __polling__ and __webhooks__. Polling involves hitting an API periodically to check for new items, and is the most popular way of building a trigger. Polling is more resource intensive than webhooks, but they're much easier for users to set up (currently users have to manually configure webhooks).

At present, polling triggers are checked every minute. Sometimes your method will be called just to populate the cache of existing records (when the workflow is initially set up by the user, when it's changed or after the workflow is reactivated).

The polling process is actually quite straightforward:

1. Fetch a time ordered list of items from the API (newest first). Set a sensible limit on the number of results, 10, 25 or 50 results is usually enough.
2. Pass the array of items to `options.poller`, along with a string referencing the property that holds the unique ID for each item in the list, and finally a callback.
3. Your callback will be passed an array of new items (or an empty array), which can then be processed further and passed back as the result.

You can define your method as a polling trigger in `config.js`:

``` js
var config = {
  name: 'A Polling Trigger',
  slug: 'a_polling_trigger',
  type: 'poller',
  kind: 'trigger',
  ...
}
```

Polling scripts will be passed a special function in their `options.poller` property, which will take care of a lot of the work:

``` js
options.poller(data, key, function(err, newItems) {
  // if newItems has length, new data is available
});
```

All you need to do is give it a list and tell it what property within each list item holds the ID. A callback is fired with an array of new items.

- `data` (Array) - An array that is to be checked for new items. This will often come directly from an API, but you may need to pick out the property containing the list of items.
- `key` (String) - The property that holds the unique ID for each item in the list. For example, on [Twitter's `user_timeline` endpoint](https://dev.twitter.com/rest/reference/get/statuses/user_timeline), each tweet that's returned contains an `id_str` property which is the unique ID for the tweet. In this case, set the key to `id_str`.
- `function(err, newItems)` - The error-first callback function is called with an error if a failure occurred, or otherwise a `null` error and an array containing the new items found (those with a key that hasn't been seen before). The array will be empty if no new items are found.

Internally, the `options.poller` function asks the database whether each key has been seen before, and if not, adds it to the array of items it returns. The core will then update the cache of items once it's handed the list of new items.

To see polling triggers in action, study our example services (see the _Example Services_ section).

### Webhooks

Flow XO has general [webhooks support](http://support.flowxo.com/article/22-webhooks), but methods within services can be triggered by webhooks too.

Users follow a similar process to setting up general inbound webhooks:

1. They're given instructions of how to set up the webhook and given the webhook URL to copy and paste.
2. Once it's in place, they fire off a test webhook.
3. We receive the test and complete the set up.

To define your method as a webhook trigger, set your `config.js` up like this:

``` js
var config = {
  name: 'A Webhook Trigger',
  slug: 'a_webhook_trigger',
  type: 'webhook',
  kind: 'trigger',
  scripts: {
    run: require('./run')
  },
  fields: {
    output: [...]
  },
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
```

This configuration will automatically be scaffolded when you choose a _Webhook Trigger_ from the list when running `yo flowxo:method`.

#### Fields

A webhook trigger cannot supply any input fields, but it should define its expected output fields in the configuration. This should match up with the format expected to be sent by the service.

#### Handling The Webhook

Notice that a webhook trigger also has a `run.js` file, just like a poller trigger or an action. This allows you to manipulate the data received from the webhook before triggering a workflow, into the format defined by the output fields config.

As an example:

``` js
// config.js
{
  ...
  fields: {
    output: [{
      key: 'fullname',
      label: 'Full Name'
    }]
  }
  ...
}

// run.js
module.exports = function(options, done) {
  var received = options.input;

  // Manipulate the received data into the format we expect
  var data = {
    fullname: received.first_name + ' ' + received.last_name
  }

  done(null, data);
};
```

The `run.js` script is mandatory for a webhook trigger. If you don't need to manipulate the data, simply pass it straight through.

``` js
module.exports = function(options, done) {
  done(null, options.input);
};
```

##### Help Instructions

You should provide a `help` property to tell the user how to configure the webhook in your service. `help.webhook.config` and `help.webhook.test` accept an array of paragraphs which will be displayed to the user when the service is being set up.

### Input Validation

Where possible, we recommend that you leave detailed input validation up to the API you are dealing with - just send the data you've got and ensure that your response handling code covers any validation errors.

However there can be times when some simple validation of the input will immediately reveal an error is going to occur before continuing, saving a roundtrip to the service.

For example, if you are writing a `get_person` method, and your `run.js` script is going to construct the following URL to query:

``` js
var personUrl = 'https://my.service.com/persons/' + options.person_id
```

If `options.person_id` is `undefined`, or contains spaces, or isn't alphanumeric, we should immediately abort.

To perform this sort of validation, the SDK provides a set of helper methods based on the [validate.js](http://validatejs.org/) library.

There are two methods available on the service:

- `service.validate`: exposes the `validate.js` object and therefore provides the entire `validate.js` API.
- `service.validateScriptInput(data, constrainsts, options)`: runs the passed data through the validator, returning any errors as an instance of `sdk.Error.ServiceError`. This is a convenience wrapper around the `service.validate` method, which is useful for validating script input data, as any returned error can be passed straight to the `done` handler of the script.

Here is an example of using the `validateScriptInput` method in a script.

``` js

// run.js

module.exports = function(options, done){
  // Input validation
  var inputErr = this.validateScriptInput(options.input, {
    person_id: { presence: true, numericality: true }
  });

  if(inputErr){
    return done(inputErr);
  }

  // Else carry on safe in the knowledge options.person_id is
  // there and is a number
}
```

The built-in validator applies some sane defaults to `validate.js`, namely:

- format: 'flat'
- fullMessages: true

#### Validating Flow XO Datetime and Boolean Fields

The SDK also provides two custom validators for dealing with Flow XO Datetime and Boolean fields. Use them as follows:

``` js
// run.js

module.exports = function(options, done){
  // Input validation
  var inputErr = this.validateScriptInput(options.input, {
    required_due_date: { fxoDatetime: { required: true } },
    optional_due_date: { fxoDatetime: true },
    required_boolean: { fxoBoolean: { required: true } },
    optional_boolean: { fxoBoolean: true },
  });

  if(inputErr){
    return done(inputErr);
  }

  // ...
}
```

#### Validating String Fields containing Dates

The vast majority of the time, you'll be expecting a `datetime` in a Flow XO field, and so you'll set the `type` to `datetime`. You then use the `fxoDatetime` validator as described above.

If, however, your regular `text` field contains a datetime string, you may wish to use the built-in _datetime_ validator from the `validate.js` library. The parsing engine for the built-in `datetime` validator uses the [`#parseDateTimeField` function in the `flowxo-utils` module](https://github.com/flowxo/flowxo-utils/blob/master/lib/index.js#L306).

### Handling Errors

The callback for your script expects either an error (if the request failed) or an object (on success). This section will help you to understand how to construct your errors.

#### Retryable Errors

These occur when you can't access a service or you get a response back in a format that you don't recognise, and are the default error type. They're usually recoverable, and so the platform will retry the request later.

When you encounter a retryable error, return a regular JavaScript error as the error argument in your callback. Either create a new one (`new Error()`) or hand back the error object passed in from a library such as `request`.

You should use a retryable error in situations like these:

- HTTP requests fail. For example, where you use `request.post()` to call the API and your callback receives an error object.
- Where you receive a 500 status code from the API, and you were expecting 200.
- If you receive a 200 status code (as expected) and test for the presence of a `result` JSON key in the body, but find that it's not there.
- A `JSON.parse` of the API's response throws an error.

Depending on the situation, you can either return an error object directly, or create a new error:

- `done(err)` (problem connecting to API)
- `done(new Error(response.statusCode + ' ' + body))` (some kind of temporary error reported by API)
- `done(new Error('Could not parse: ' + body))` (API returns invalid JSON)

It's up to you what information your error contains, but make sure it describes the problem. The user will never see these error messages, they're logged and monitored by Flow XO.

The core will retry the request up to 5 times (with exponential back-off), and if after the 5th attempt a retryable error still occurs, it will be written to the workflow log as "The request failed because something unexpected happened.".

If you are in doubt about what error to return, use a retryable error, to give the script the best possible chance to succeed.

#### Service Errors

Service errors are where a user's request can't be completed for operational reasons. This includes validation errors, objects not being found, quotas being exceeded, etc.

The core does not make any attempt to retry after a `ServiceError`. Instead, the error message provided with the `ServiceError` is written to the workflow log, and the error object is logged and monitored by the core.

If you run into an error, create a `ServiceError` object and return it as the error argument in your callback:

``` js
cb(new sdk.Error.ServiceError('You must provide a value.'))
```

There might also be times where you'd like to include an error object along with your message for debugging purposes, although the error itself won't be shown to the user:

``` js
cb(new sdk.Error.ServiceError('You must provide a value.', err))
```

Take care with the tone and style of the message passed to your `ServiceError`, as it will be displayed directly to the user.

#### Auth Errors

A special case is where the API returns an error relating to authorization (usually when a REST API returns a status code `401`).

Use an instance of `AuthError`, which is very similar to `ServiceError`. If the service is authorized with OAuth 2, the platform will attempt to refresh the OAuth token and retry the request once. If that doesn't succeed, or if the service is not authorized with OAuth 2, the error will be written to the workflow log.

Take care with the tone and style of the message passed to your `AuthError`, as it will be displayed directly to the user.

## Help Docs

Each service has a corresponding help document. Add the help doc URL with the `help` property on the service's `config.js`.

For example:


``` js
var service = new sdk.Service({
  serviceRoot: __dirname,
  name: 'Your Service',
  slug: 'your_service',
  help: 'http://support.flowxo.com/your_service'
});

module.exports = service;
```

## Testing and Environment

Integration tests are mandatory. Unit tests are not required as essentially each service is a wrapper around http calls to an external API. The coverage provided by the integration tests provides sufficient confidence that the service is working correctly.

[Integration testing](http://en.wikipedia.org/wiki/Integration_testing) emulates how the Flow XO platform will use your service, using the live API. You complete the input data and the method's `input.js`, `output.js` and `run.js` scripts are run in order, passing the provided data through and displaying the results. You can also record a series of integration tests, and replay them in order.

You'll need to record a series of integration tests to demonstrate that the service is operating correctly. These will be replayed and validated when you submit (or update) the service. For this reason, integration testing is mandatory.

### Setup

Prior to running integration tests, you'll need to initialise the test environment:

```
grunt init
```

### Authentication

Since your integration tests will be hitting the service's real API, before running the tests, it's important to generate some authentication credentials.

This is achieved using the command

```
grunt auth
```

Once acquired, the `grunt auth` task will automatically populate the credentials in a file `credentials.json`. The contents of this file are read by the SDK and are used for all integration tests. This file __should not__ be committed to version control - an entry in the `.gitignore` file takes care of this.

You'll acquire credentials in a different way, depending on the service.

#### Basic Credentials

If your service authenticates with basic `credentials` (e.g. API key), you'll be prompted to enter the details on the command line.

Once all details have been filled in, the service's `ping.js` script is run, to validate that the credentials are correct. Ensure this has been implemented correctly, otherwise the credentials won't be stored.

#### OAuth

If your service authenticates via OAuth, running `grunt auth` will open a browser window, where you'll need to enter your username/password to authenticate with the service. We'll provide you with these login details.

Prior to running `grunt auth`, there are a few things you'll need to configure.

Firstly, configure the consumer key and secret (for OAuth 1) or client ID and secret (for OAuth 2). We'll provide you with this information, which you should add to the `.env` file. It's important that these details are only added to the `.env` file, and nowhere else - they should be treated as confidential and __not committed to version control__.

A typical .env file for OAuth 2 will look like this:

```
GOOGLE_SHEETS_ID=asdasd55151211515.apps.googleusercontent.com
GOOGLE_SHEETS_SECRET=65651a5151_uhypiuagsdu
```

The field names that you populate in the .env file must match what you using in the OAuth configuration in your services `index.js` file. This service is named _Google Sheets_, and so the environment variables should be `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_SECRET`. If you are using the yeoman generator, these variables will be scaffolded for you.

Secondly, since OAuth relies on redirecting the browser window to a URL hosted by our server, in order to complete the auth flow, you'll need to setup a hostfile redirect on your machine. The consumer key / client ID and secret we provide you with will link to an account with an OAuth `redirect_uri` set to `http://flowxo-dev.cc:9000`. This means that you need to ensure that when the browser redirects to this address, it accesses your machine. The easiest way to do this is to add an entry to your hostsfile (`/etc/hosts`) with the following line:

```
127.0.0.1   flowxo-dev.cc
```

Typically most OAuth APIs require you to specify your callback hostnames in their control panel, so you should use the one above.

_Note - you may be wondering why we don't just use `http://localhost:9000` or `http://127.0.0.1:9000`as the `redirect_uri`. Unfortunately, some OAuth providers do not allow `localhost` or `127.0.0.1`, and so we have invented a fake TLD to use instead._

You can change the URL and port used for OAuth with the `OAUTH_SERVER_URL`, `OAUTH_SERVER_PORT` and `PORT` settings in your `.env` file.

##### Callback URL for development

The Callback URL or `redirect_uri` used for development is generated automatically. By default, it will take the form:

```
http://flowxo-dev.cc:9000/auth/service/<name>/callback
```

You'll often need to add this to the OAuth provider's web portal, to allow access to their authentication server.

Sometimes, the OAuth provider will enforce a `https://` callback URL. You can easily switch to SSL mode by changing the `sslOAuthCallback` option in your service's Gruntfile.js to `true`:

``` js
grunt.initConfig({
  flowxo: {
    auth: {
      options: {
        sslOAuthCallback: true
      }
    }
  }
})
```

Alternatively, if you want to have complete control of this URL, you can set the `OAUTH_SERVER_URL` and `OAUTH_SERVER_PORT` environment variables, as described above.

### Running Tests

You run an integration test with

```
grunt run
```

This will prompt you for the method to run, along with the input data, and will then run the `input.js`, `output.js` and `run.js` scripts, in that order, if available. The end result will be displayed to the screen, with the option to run another method, or end.

_Note: when entering input data, if you don't enter a value for a text, textarea or dictionary input, the `run.js` script will not include an item in the `options.input` object for that particular input. In order to test blank string entry into the run script, type `''` or `""` for that particular input._

You can also run a single method script:

```
grunt run --single
```

### Recording Tests

You can record a series of integration tests with

```
grunt run --record
```

In this mode, your input actions are captured, so they can be replayed later with

```
grunt run --replay
```

By default your test actions are captured to the `runs/` folder, to a file `runs.json`.

However, it is preferred that you record integration tests for each method, to a separate file. For example:

```
grunt run --record --name=add_customer
grunt run --replay --name=new_customer
```

Note that subsequent calls to `grunt run --record --name=add_customer` will append to your existing actions, rather than overwrite them.

If you need to start a fresh set of actions, you'll need to clear the file manually.

The `runs/` folder can be committed to version control, allowing others the chance to replay tests you have recorded. Bear in mind that they will often need to be authenticated as the same user as you in order to replay the tests successfully.

### Test Documentation

Integration test documentation is very important. Without it we cannot verify that your service works as expected.

[Here is an example](https://github.com/flowxo/flowxo-services-trello-example#integration-tests) of how to document your integration tests in the `README.md` file.

### Testing Pollers

The first time an integration test is run for a poller, you'll see no data returned from the service. This is due to the way that pollers work.  The first time the API is hit, the poll cache is filled with all existing data from the service.

To simulate a poller finding new data, you will need to:

- Run a poller method.
- Run a 'create data' method, or manually create new data in the service.
- Run the poller method again.

The poll cache is stored in memory for the duration of the `grunt run --record` or `grunt run --replay` session.  As soon as you exit `grunt run`, the poll cache is lost.

## Examples

### Example Services

- [Flow XO Trello Service Example](https://github.com/flowxo/flowxo-services-trello-example)
- [Flow XO Stripe Service Example](https://github.com/flowxo/flowxo-services-stripe-example)

### Code Sample Index

This index will help you to drill down into our example services and find code relating to all the concepts described in this documentation.

- [API Access - Using a Wrapper Library](https://github.com/flowxo/flowxo-services-stripe-example/tree/master/lib)
- [API Access - Using Node Request](https://github.com/flowxo/flowxo-services-trello-example/tree/master/lib)
- [Authentication - OAuth 1](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/index.js#L12-L51)
- [Authentication - OAuth 2](https://github.com/flowxo/flowxo-services-stripe-example/blob/4c308d3e8517e0ad05dffd2de9bb4dfc1eac2c8f/lib/index.js#L9-L44)
- [Authentication - Key/Credentials](https://gist.github.com/johnmjackson/515dcd24d9fb2389e647)
- [Errors - Authentication](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/index.js#L90-L95)
- [Errors - Retryable](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/index.js#L78-L83)
- [Errors - Service](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/index.js#L97-L116)
- [Input Fields - Boolean](https://gist.github.com/johnmjackson/47280df7f1ad6202c0c7)
- [Input Fields - Custom Fields](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/new_card/input.js)
- [Input Fields - Datetime](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/config.js#L33-L37)
- [Input Fields - Datetime (Handling)](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/run.js#L44-L62)
- [Input Fields - Dependant Fields](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/input.js)
- [Input Fields - Select](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/config.js#L22-L33)
- [Input Fields - Static](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/config.js#L13-L52)
- [Integration Tests](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/README.md#integration-tests)
- [Output Fields - Custom Fields](https://gist.github.com/johnmjackson/df14aaf8863d3b42ad0d#file-example-output-js)
- [Output Fields - Dealing with Arrays](https://github.com/flowxo/flowxo-services-stripe-example/blob/4c308d3e8517e0ad05dffd2de9bb4dfc1eac2c8f/lib/methods/new_customer/config.js#L133-L136)
- [Output Fields - Dealing with Nested Properties](https://github.com/flowxo/flowxo-services-stripe-example/blob/4c308d3e8517e0ad05dffd2de9bb4dfc1eac2c8f/lib/methods/new_customer/config.js#L130-L133)
- [Output Fields - Static](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/new_card/config.js#L13-L172)
- [Poller Trigger - No Inputs](https://github.com/flowxo/flowxo-services-stripe-example/tree/master/lib/methods/new_customer)
- [Poller Trigger - With Inputs](https://github.com/flowxo/flowxo-services-trello-example/tree/master/lib/methods/new_card)
- [Validation](https://github.com/flowxo/flowxo-services-trello-example/blob/2c43b37b9d56d03f7226db47103a0db7ad5c55b7/lib/methods/add_card/run.js#L5-L54)

## Authorized Libraries

Each service is manually reviewed before we make it available in Flow XO, and part of that process is making sure that only authorized libraries are used in your scripts.

We do this for security and stability reasons, and also so that we can help developers without having to learn a different library each time.

If you need a library that isn't on this list, please get in touch so we can review it (we'll usually accept well written and maintained API wrapper libraries).

- [async](https://github.com/caolan/async) - Async utilities
- [request](https://github.com/request/request) - Simplified HTTP request client
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - XML to object conversion
- [validate.js](http://validatejs.org/) - Validating javascript objects (commonly the input data)
- [q](https://github.com/kriskowal/q) - Promise library
- [lodash](https://lodash.com/) - JavaScript utility library

If you are developing an OAuth service, you'll also need to use a passport strategy. Find yours from the [list of providers](http://passportjs.org/guide/providers/).

## Updating a Method

Once a method is made available, it can't be changed or deleted, only deprecated (and usually replaced with a newer version). This is because there may be users which have workflows configured with the old method, and we don't want to break their workflows by removing it.

To deprecate a method, simply set `{ deprecated: true }` in the `config.js`. You can then create a replacement method with a versioned slug `{ slug: 'a_method_v2' }` (it's OK to use the exact same `name` in your new version, only the `slug` needs to be unique). A deprecated method will not be available for selection when the user is configuring a new trigger or action, but will still be available for existing workflows.

Of course, you'll need to submit a Pull Request (PR) to the main `flowxo`-owned repo to have the changes made live.

## Submitting Your Service

Before you submit your service to us, please work through this checklist:

- Include a set of `grunt run` integration tests that we can `grunt run --replay` to see your methods working well.  We need to see your methods dealing with a variety of input (both valid and invalid). It's best to [get in touch](mailto:support@flowxo.com) with us at this stage so we can explain what you need to do here.
- Run `grunt preflight` to ensure code conforms to the specified code conventions, and is 'beautified'.
- If there's anything else we need to consider when reviewing your service, it should be included in `README.md`.

To submit, please [email us](mailto:support@flowxo.com) with details of the service you've built and your contact details, and we'll explain what to do next. Thanks for supporting Flow XO!
