# Flow XO Service Code Examples

This guide will be referring to the following example repositories which you can clone and try them out locally.

1. [Flow XO Trello Service Example](https://github.com/flowxo/flowxo-services-trello-example)
2. [Flow XO Stripe Service Example](https://github.com/flowxo/flowxo-services-stripe-example)
3. [Flow XO Google Sheets Service Example](https://github.com/flowxo/flowxo-services-google-sheets-example)

We have also put together a quick guide to [using Grunt with Flow XO](GRUNT.md)

### Here is a complete list of the topics that our code samples cover:

1. [OAuth1 Authentication Example](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/index.js)
2. [OAuth2 Authentication Example](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/index.js)
3. [Key/Credentials based Authentication example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/index-credentials-based.js)
4. [Simple Poller Trigger Example](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/run.js) 
5. [Connecting to an external API using Request.js](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/client.js#L47)
6. [Connecting to an API using a wrapper Node.js module](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/client.js#L25)
7. [Poller Trigger with Inputs Example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/new_worksheet/) 
8. [Input Field Example: Text Box](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/delete_row/config.js)
9. [Input Field Example: Text Area](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L19-21)
10. [Input Field Example: Simple Select (Combo Box)](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L22-29)
11. [Input Field Example: Select (Combo Box) with Dependant Fields](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/input.js#L21-35)
12. [Input Field Example: Date/Time Field Example](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/methods/add_card/config.js#L34-35)
13. [Input Field Example: Boolean Field Example](README.MD#L463)
14. [Input Field Example: Custom Input Field Example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/input.js) 
15. [Output Fields Example: Arrays](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/config.js#L137)
16. [Output Fields Example: Nested Data with Double Underscore Notation](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/config.js#L137)
17. [Output Field Example: Custom Output Field](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/get_row/output.js)
18. [Error Handling Example: Retryable Errors](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/client.js#L79)
19. [Error Handling Example: Service Errors](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/client.js#L361)
20. [Error Handling Example: Authentication Errors](https://github.com/flowxo/flowxo-services-trello-example/blob/master/lib/client.js#L79)
21. [Grunt - Recording and Replaying Integration tests](README.MD#L1207)
22. [Integration Tests - Documentation How To](README.MD#L1232)
23. [Integration Tests - Documentation Example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/get_row/readme.md)

### We have put together a summary list of challenges that you may come across with links to code examples:

1. How do I implement authentication in my service? [Answer](README.md#L134)

2. What OAuth scopes should I apply to my service authentication and where do I find them?
    
    [Example of appending scopes for Google Sheets](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/index.js#L43)

    Each API provider will have different scopes that they require and their names are specific to that provider.
    
3. How do I test a poller Trigger? [Answer](README.md#L1249)

4. What are input fields?
    
    Input fields ask the user for additional information. This information is collected in one or more fields and is passed to your method.

    For instance our ```new_worksheet``` [trigger in Google Sheets](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/new_worksheet/) needs to know the Spreadsheet ID so that it can run.
    
    
5. What are the different types of input fields and how do I specify them?

    [Types of Input Fields](README.md#L317)
    
    Static input fields can be specified in your config.js file. 
    
    [Custom input fields](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/input.js) can also be returned from your input.js file. 
    
    The input.js file should be linked from your methods [run.js](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/add_row/run.js) file.
    
6. What are dependant input fields?

    An input field whose value(s) depends on the value of another field. Only select (drop down box) fields can have dependant fields.
    
    For example, in our google sheets example repository, our get_row action has a spreadsheet id field. It also has a worksheet id field, so the user can specify which worksheet, to get the data from.
    
    Before the list of worksheets can be populated, the user must select a spreadsheet. Therefore the spreadsheet has ```dependants: true``` set on its object, which tells the SDK to call into input.js when the field value has changed.
    
    [Dependant field setup example](https://github.com/flowxo/flowxo-services-google-sheets-example/blob/master/lib/methods/get_row/input.js)
    
7. The data returned from the external api has nested fields, how do I map those into output fields.

    [Output Fields Example: Nested Data with Double Underscore Notation](https://github.com/flowxo/flowxo-services-stripe-example/blob/master/lib/methods/new_customer/config.js#L137)
    
    
    

