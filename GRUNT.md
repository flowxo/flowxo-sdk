# Using Grunt with a FlowXO Service

The Grunt Task runner is a really simple way of performing tasks.

The [gruntfile.js](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/gruntfile.js) has a number of useful tasks that you can run from your command line.

Make sure your current working directory is at the location of the gruntfile.js.

Any grunt task can be run from the command line by typing ```grunt [taskname]```

The tasks that are setup for grunt, when you service was scaffolded are:

1. ```grunt``` - this will run the default grunt task which is to beautify your code and lint it.
2. ```grunt init``` - this installs the Flow XO SDK depdencies
3. ```grunt auth``` - this launches a browser window so that you can authenticate with your external API (i.e. Stripe). Your credentials will then be written to credentials.json, so that the next task will work.
4. ```grunt run```  - this allows you to choose a method to test. It will use your credentials.json to execute http calls against the real external api.

Primarily ```grunt run``` will be used to record integration tests. Further information on how to record integration tests and replay them can be found [here](README.md#L1207)