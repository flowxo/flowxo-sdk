# Introduction

[Flow XO](https://flowxo.com) is a platform that enables users build automated sales & marketing workflows on top of their existing cloud apps.

What does this mean? Well imagine you want to send a Google Mail to your Manager when you make a new sale in your [Stripe](http://www.stripe.com) account, the FlowXO platform allows you to express this connection between Stripe and Gmail.

It's not just Gmail or Stripe intergration that FlowXO can support, essentially any external API can be connected to the FlowXO core platform. Each integration is known as a FlowXO Service.

Luckily it is really easy to create a FlowXO service. All you need to do is to write your service code in Node.js using the FlowXO SDK.

Anyone can build support for their service into Flow XO. The SDK gives you scaffolding for your service, a command-line tool to run your methods locally.

If you get stuck, just send us an email at [support@flowxo.com](mailto:support@flowxo.com) and we can guide you.

The FlowXO SDK is an easy to use, it's just a node.js module!

So this README will guide you through the steps to creating your very own service. It has lots of code examples, which we urge you to look at.

We will be using [Stripe](https://stripe.com/docs/api) and [Google Sheets](https://developers.google.com/google-apps/spreadsheets/?hl=en) as reference examples


# What will our services do?

This guide is pre-dominantly about the creation of the FlowXO Stripe Service but will also refer to separate Google Sheets service for our code examples.

We will add a row to a worksheet of a Google Spreadsheet, whenever a new Stripe Customer is created. Cool!. So let's get started.

# What do I need?

The [FlowXO SDK](https://github.com/flowxo/flowxo-sdk) is written in node.js. 

We recommend that you use the amazing [Cloud9 IDE](http://www.c9.io) for developing FlowXO services. It offers a free simple nodejs environment that integrates with GitHub. Please see our [FlowXO on Cloud9 Guide](cloud9.md)

If you are using a Windows OS for your node.js development please see the [FlowXO on Windows Guide](windows.md)

We use GitHub to host the services code, and you'll need to be familiar with forking and creating pull requests, as this is the workflow we will be using to validate your service.

As most modules will be fairly thin wrappers around HTTP API's, you should understand how to make HTTP requests in Node and how to work with Grunt and Git. We have put together the following simple guides which will be useful:

* [Git](github.md) - Working with Git for FlowXO development
* [Making Http calls](http.md) - Making Http Request with node.js and request.js
* [Grunt](grunt.md) - Understanding the Grunt Task Runner

That's all. The other tools that the SDK uses will be installed locally with npm install.

# Service Authoring Guidelines

Please review our [Service Authoring Guidelines](GUIDELINES.md) which detail the code conventions, language, style and structure that services should follow.

# Example Services

We have excellent example FlowXO service repositories, that cover just about all simple and advanced concepts of service creation.

This guide will be referring to the following example repositories which you can clone and try them out locally.

1. [Trello Example](https://github.com/flowxo/flowxo-services-trello-example)
2. [FlowXO Stripe Service Example](https://github.com/flowxo/flowxo-services-stripe-example)
3. [FlowXO Google Sheets Service Example](https://github.com/flowxo/flowxo-services-google-sheets-example)

Here is a complete list of the topics that our code samples cover:

1. [OAuth1 Authentication Example](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/index.js)
2. [OAuth2 Authentication Example](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/index.js)
3. [Key/Credentials based Authentication example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/index-credentials-based.js)
4. [Simple Poller Trigger Example](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/run.js) 
5. [Poller Trigger with Inputs Example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/new_worksheet/run.js) 
6. [Input Field Example: Text Box](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/delete_row/config.js)
7. [Input Field Example: Text Area](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L19-21)
8. [Input Field Example: Simple Select (Combo Box)](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L22-29)
9. [Input Field Example: Select (Combo Box) with Dependant Fields](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/input.js#L21-35)
10. [Input Field Example: Date/Time Field Example](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L34-35)
11. Input Field Example: Boolean Field Example
12. [Input Field Example: Custom Input Field Example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/input.js) 
13. [Output Fields Example: Arrays](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/new_customer/config.js#L137)
14. [Output Fields Example: Nested Data with Double Underscore Notation](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/new_customer/config.js#L137)
15. [Output Field Example: Custom Output Field](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/get_row/output.js)
16. [Error Handling Example: Retryable Errors](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/client.js#L79)
17. [Error Handling Example: Service Errors](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/client.js#L342)
18. [Error Handling Example: Authentication Errors](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/client.js#L79)

Here is a list of concepts covered in this guide:

1. Forking a GitHub Service Repository
2. Cloning Your Service Repository
3. Scaffolding Your Service
3. Service Code Structure
4. Implementing Authentication
5. Understanding Triggers and Actions
6. Working with Triggers
7. Fetching Data from an External API
8. Running a Trigger with Grunt and the FlowXO SDK
9. Triggers and Actions with Inputs
10. Recording and Replaying Integration Tests
11. Error Handing
12. Coding an Action

So lets get started!

# Step 1 - Fork the service Repo

[Watch the Video](http://www.youtube.com/flowxo/)

Please email [support@flowxo.com](mailto:support@flowxo.com) and tell them what service you want to develop. They will create you a blank [FlowXO GitHub repository](http://www.github.com/flowxo). 
By doing this first you will save yourself a lot of pain later, when you need to submit your service to FlowXO.

Assuming this repository has been created for you:

* Visit [GitHub](http://www.github.com)
* Sign In with your GitHub account
* Go to the blank FlowXO repository i.e. `https://www.github.com/flowxo/<your-service-name>` 
* Now fork this repo into your account. (Remember our [GitHub User Guide for FlowXO] if you have trouble doing this).
* Voila! You now have your own private copy of this service repository that you can being working with.
    
# Step 2 - Cloning your Service Repository

[Watch the Video](http://www.youtube.com/flowxo/)

Now it time to get your repository into your development environment of choice. Whether you are on a Windows Platform or using Cloud9, you will need to use the following command.
 `git clone <http url of the repository>`. If you are not sure of this url to clone, you can find it on GitHub. i.e. `https://www.github.com/<yourusername>/<your-service-name>`. It will be displayed on the left hand side.
 
# Step 3 - Scaffold your new Service

[Watch the Video](http://www.youtube.com/flowxo/)

To make it easy to scaffold your service, we've written a [Yeoman](http://yeoman.io/) generator, which complements this SDK. 

When you forked the flowxo repo, it may already be scaffolded. You can check this by looking for a lib directory with an index.js file.

If you type `yo` into your bash shell you should see some output. If you do not then install yeoman with 

    npm install -g yo  

You will notice that your service repository has been named like this 

    flow-services-<servicename> 
    
so for example: 

    flowxo-services-trello or flowxo-services-stripe
    
Ok, let's get our service scaffolded. We are going to create our Stripe service first. Let's install the yeoman generator that FlowXO have created for us.

``` bash
npm install -g yo generator-flowxo
```

Now, runing will present a set of questions that will help us scaffold our service.

``` bash
yo flowxo
``` 
to generate a service.

The first question is:

1. *What is the full name of your service (e.g. EchoSign or PipeDrive)?*
2. Enter: **Stripe**
3. *What sort of authentication does the service use? (Use arrow keys)
    ❯ Credentials (e.g. API Key or username/password) 
      OAuth 1 
      OAuth 2*

First of all read our [Authenticating FlowXO for Services](authentication.md). This guide discusses OAuth1, OAuth2 and Credential based authentication for your service.

You should review the api document of the external api you are developing the service against and find out what authentication mechanisms they support. Ideally we want to use OAuth2. As you can see from the [Stripe API Docs](https://stripe.com/docs/api#authentication) they support authentication via an API Key.
[Google Sheets](https://stripe.com/docs/api#authentication) for instance, supports OAuth2

If you select a _Credentials_ service, you'll be asked to define the fields that the user must complete. Normally this would be a username, password, API key, token, account name, etc. Just define all the fields you'll need to collect in order to access and authorize against your service's API. See the _Authorization > Credentials_ section for more information.

If you select an _OAuth1_ or _OAuth2_ service, some skeleton configuration will be created that will need to be updated later. See the _Authorization > OAuth_ section for how to do this.

Choose your authentication mechanism in your bash window and you should now have a populated directory with some scripts. Next, we'll take a look at what we've generated.

The final output of your scaffolded service will look like [this](https://github.com/flowxo/flowxo-services-google-sheets-example)

You can see that the FlowXO generator has created an [index.js](https://github.com/flowxo/flowxo-services-google-sheets-example/lib/index.js)

This file has been configured with the name of your service and a skeleton structure so you can setup authentication.


# Step 4: The Code Structure of your new Service

[Watch the Video](http://www.youtube.com/flowxo/)

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
        |-- input.js - optional, returns dynamic input fields
        |-- output.js - optional, returns dynamic output fields
      |-- another_method/
        |-- ...
  |-- runs/  - created when test runs are recorded
```

The service expects files to remain in their default locations, so try not to move things around unless you know what you are doing.

Now change your working director to your service i.e.

```
cd ./flowxo-services-stripe
```

You need to initialize the FlowXO SDK by typing

```
grunt init
```

The above is simple way of installing all the node module dependencies that the FlowXO SDK requires.

If you are new to `grunt` please read our [Understanding the Grunt Task Runner](grunt.md) guide.

# Step 5: Implementing Authentication

FlowXO may already have implemented authentication for you. Authentication is setup in your service, so that the service can connect to someone's account when your service is being used as part of their workflow.

There are different ways that external API's support authentication:

1. OAuth 1
2. OAuth 2
3. Credentials/API Key

If the external API (i.e. lets say Stripe for instance), supports different authentication mechanisms, we always want to choose OAuth2.

## OAuth1 Example

[Trello uses OAuth1](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/index.js)

Notice that the example uses the *require('passport-trello').Strategy* , a passport.js OAuth1 module for Trello.

The names of the keys that the service requires are consumerKey and consumerSecret. These service properties are populated from environment variables.

The environment variables are read by the SDK from a ```.env``` file.

* consumerKey: process.env.TRELLO_KEY,
* consumerSecret: process.env.TRELLO_SECRET
    
The values to put into your .env file, can be obtained from your account within Trello (just like with most other API's i.e. Google, LinkedIn etc)

You need to put these values into a ```.env``` file in the root of your service. ```.env``` files are not committed to GitHub, so here is an example

```
TRELLO_KEY=someKeyYouGotFromYourTrelloAccount
TRELLO_SECRET=theSecretKeyFromYourTrelloAccount
```

## OAuth2 Example

Here is an example of [OAuth2 setup using the Stripe API](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/index.js)

Notice that in the strategy we have used a pre-existing Passport.js Stripe Node Module that simplies the OAuth2 authentication process with stripe.

You will see that the [Google Sheets OAuth2](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/lib/master/index.js) also uses a custom passport.js library `require('passport-google-oauth').OAuth2Strategy,`

The names of the keys that the service requires are clientID and clientSecret. These service properties are populated from environment variables.

* clientID: process.env.GOOGLE_SHEETS_ID,
* clientSecret: process.env.GOOGLE_SHEETS_SECRET

The values to put into your .env file, can be obtained from your Google Developer Console (just like with most other API's i.e. Freshbooks, LinkedIn etc)

You need to put these values into a ```.env``` file in the root of your service. ```.env``` files are not committed to GitHub, so here is an example

```
GOOGLE_SHEETS_ID=someKeyYouGotFromYourGoogleAccount
GOOGLE_SHEETS_SECRET=theSecretKeyFromYourGoogleAccount
```
  
## Credentials based example

Some API's, like JotForm do not support any of the OAuth mechanisms. Instead, they provide an API key. This is known as a credentials based service.

So for a credentials based service, we expect the main part of our index.js file to look like this:

```
var service = new sdk.Service({
  serviceRoot: __dirname,
  name: 'JotForm',
  slug: 'jot_form',
  auth: {
    type: 'credentials',
    fields: [{
      type: 'text',
      key: 'api_key',
      label: 'API Key',
      description: 'For help on finding your API key, visit the Flow XO support page ' +
        'at http://support.flowxo.com/article/29-jotform',
      required: true
    }]
  },
  scripts: {
    ping: require('./ping')
  }
});

```

# Step 6: Understanding Triggers and Actions

[Watch the Video](http://www.youtube.com/flowxo/)

It is well worth creating a [FlowXO Demo Account](http://www.flowxo.com) to create a few simple workflows so that you can understand more about how **triggers** and **actions** work.

A **trigger** is code we want to run when some data is created on the external API. For instance, in the [Stripe Customer API](https://stripe.com/docs/api#list_customers) we might want to *listen* to when a new customer is created.

A **trigger** is the catalyst that sparks a workflow. i.e. *when a new customer is created in Stripe, I want to do something with that customer data* 

Our Stripe service is not concerned with *what* we want to do with the data, this is the job of an **Action**.

An **action** method provides functionality to perform CRUD (create, update or delete) operations on an API.

So lets consider what we could do when a new customer is created in Stripe:

* How does the customer get created? Well most likely a transaction on someones website, has created a new customer in their stripe account

* How do we find out that a new customer has been added to that FlowXO user's Stripe Account? We write a **trigger** method, that typically *polls* the Stripe API, asking for the list of most recent customers. The FlowXO core then recognises which customers it has not seen before and fires our **trigger** method for each one.
 
* How is an **action** linked to a **trigger**. A FlowXO user will have defined a workflow, that specifies something to do when the trigger is fired.

* Triggers are typically named like this

    *   new_<record> i.e. when a new record is created on the external api (i.e. Stripe)
    *   updated_<record> i.e. when a record on the external API (i.e. Stripe) is updated
    *   task_completed i.e. when something is done to a record that we want to monitor
    
* Actions are typically named like this:

    *   add_a_<record> i.e add_a_customer
    *   delete_a_<record> i.e. delete_a_customer
    *   update_a_<record> i.e. update_a_customer
    *   complete_a_task i.e. do something to a task. 


# Step 7 - Our First Trigger

[Watch the Video](http://www.youtube.com/flowxo/)

Here is an [example of a simple polling trigger](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/run.js) that uses the Stripe API to fetch the list of latest customers.

There are 2 different types of triggers that FlowXO supports. Once is a *polling trigger* and the other is a *webhook trigger*. They are both a simple concept.

This guide will focus on the *polling* trigger. As its name suggests, FlowXO will run our trigger code periodically, every few minutes or so in fact.

A webhook trigger, is when the external api (i.e Stripe) will call a FlowXO http(s) endpoint when new data or events happen in a customer's account.

We prefer to create *polling* triggers as they are easier to implement.

Our code will be *polling* code, i.e. it will go and fetch data from the external API, in this case Customers in a Stripe Account and give that data back to FlowXO.

Lets crank up our trigger in no time at all!

At your bash shell prompt type:

```
yo flowxo:method
```

This will ask a series of questions so we can scaffold our `New Customer` trigger.

```
$ yo flowxo:method
? What is the user-visible name of the method e.g. Add a Document: New Customer
? What slug would you like for the method? e.g. add_a_document: new_customer
? What type of method is it? Poller Trigger
? Select which scripts you would like to generate for the method. 
   create ../../../tests/new_customer.spec.js
   create config.js
   create run.js
   
 ```
 
 If you look inside your `./lib` direction you will now see a folder for this new trigger.
 
 [This code example](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/run.js) shows how the Stripe new_customer trigger is coded
 
 ## Input Fields for Triggers
 
 Some triggers, as in the code example above, do not require any user input. 
 
 You can determine this by looking at the [config.js](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/config.js) file of the method
 
 ```
 var config = {
  name: 'New Customer',
  slug: 'new_customer',
  type: 'poller',
  kind: 'trigger',
  scripts: {
    run: require('./run')
  },
  fields: {
    input: [],
    output: [{
      key: 'object....
    ```
 
 The inputs array for the fields property on the config object is an empty array.
 
 Here is an example of a [Google Sheets Trigger that requires inputs](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_worksheet/run.js), called *new_workseet*. This trigger is designed to, well, trigger, when a new worksheet is added to a Google Spreadsheet.
 
 As you might expect, this trigger is going to need to know which spreadsheet to monitor so it can keep a look out for any new worksheets.
 
 
 
 # Step 9 - Fetching data from Stripe when our Trigger is run.
 
 [The example code is here](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/run.js)
 
 We can drop the code below into:
 
 ```
 ./flowxo-services-stripe/lib/new_customer/run.js
 ```
 
 ```
 'use strict';
var Q = require('q');

module.exports = function(options, done) {

  var client = new this.Client(options.credentials, this);
  var returnNewItems = Q.denodeify(options.poller);
  client.getCustomers()
    .then(returnNewItems)
    .nodeify(done);

};
```
 
Now type:

```
grunt run
```

at the command line now, we should see our shiny new trigger presented as an option. If you select it you will get an error as we have not implemented authentication for our Stripe service yet, or code the Client object that will make our http calls.

`this` refers to the current instance of our FlowXO Stripe Service. 

For now we have written all the code we need to in order for our trigger to be called by FlowXO. When our FlowXO Stripe Service is deployed by FlowXO, it will run the code in our ./lib/new_customer/run.js file and get some data.

So where does that service code live and how do we attach a Client object to it? Here are the steps listed that we must accomplish to make our trigger complete:

1. Implement Authentication for our Service
2. Create a client object that has a function that can get the list of customers from Stripe
3. Configure our output fields (i.e. the fields from a customer record that we will return to FlowXO) 

# Step 10 - Getting Customers from Stripe with our Client object

The client object is a file you add to your service, that will expose functions that are memorably named. These functions will make specific calls to the external API.

Here is an example of the [Stripe Service API Client](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/client.js)

Our Stripe repository uses an existing node.js module written for the Stripe API. Not all external API's have existing wrapper node modules and some require raw http requests to be made.Credentials based example

You can see the raw http requests in these two code examples:

1. [Trello Client](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/client.js)
2. [Google Sheets Client](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/client.js)

You will notice that our [run.js file](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/new_customer/run.js) then uses this client object to retrieve the customers from stripe.

# Step 11 - Running our Trigger

[Watch the Video](http://www.youtube.com/flowxo/)

Our trigger can be executed with our grunt test runner. If you are not familiar with Grunt, please review our [Grunt Guide](grunt.md)

For Poller triggers you need to populate the poller cache first, then generate some new data for the poller to find and then run the trigger again to see the *new* data that the poller has added to its cache.

Remember that the Poller is simply a cache of the records seen. When a new record is retrieved from the external API, the poller will fire the trigger for each new record.

# Step 9 - Triggers and Actions with inputs

[Watch the Video](http://www.youtube.com/flowxo/)

todo: discuss, using Google Sheets, new_row as an exmaple, how input fields collect data

# Step 10 - Configuring Output Fields

[Watch the Video](http://www.youtube.com/flowxo/)

todo: array handling, nested data, double underscore, custom fields

# Step 10 - Recording and Replaying Integration Tests

[Watch the Video](http://www.youtube.com/flowxo/)

todo: grunt run --record, --replay , --name etc, what integration tests should check for

# Step 11 - Error Handling

[Watch the Video](http://www.youtube.com/flowxo/)

todo: retryable errors, service errors, auth errors

# Step 12 - Coding an Action

todo: using google sheets add a row as an example
