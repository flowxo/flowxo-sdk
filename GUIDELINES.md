# Service Authoring Guidelines

## General

- We only need to support 'transient' business objects, such as contacts, invoices, emails, transactions, etc. We don't generally need to support more fixed objects like users, labels, categories, etc.
- Bear in mind that we won't have time to come back to services in the short term, as there will be so many to build. When deciding what to include/drop from services support, think 'can we live without this for 18 months?'. If necessary, drop entire triggers/tasks, don't do half a job with a trigger/task.
- On triggers, allow the user to refine the trigger (search terms, important attributes), but always bear in mind that Flow XO will be able to filter based on data from multiple tasks, so many workarounds in Zapier are not necessary in Flow XO (e.g. 'Is unique sender' in Gmail can be solved in Flow XO by checking if the sender is new in a second task).
- Don't build options into the trigger that are intended as a temporary measure until filters come along. That will mess up the UX and filters will come soon after launch anyway.
- Always look to recognise where things have been 'bolted on' to Zapier as workarounds, or where Zapier have had to do things because of older API's that have bow been improved upon. They have a lot of technical debt like that.
- Keep in mind our more focused use case of sales and marketing when deciding which triggers and tasks to support.
- Always favour simplicity and keeping a trigger/task simple over allowing for every single use case. As I said above, often users in Flow XO will be able to accomplish things by putting 2-3 simple triggers/tasks together.
- Consider input fields much more expensive to the user experience than output fields. Think carefully about expanding the input fields (much harder for user to get their head around), but don't worry too much about having quite a lot of output fields (can be solved by improving the UI in the future). We never know when an output field might be useful.

## Language & Style

- Use an informal, but business-like style. Talk to the user as if you're talking to a colleague at the office! So instead of Please be aware, providing a value here will copy the value into the field B, go with If you put something here, we'll copy it into B.
- Avoid technical words and jargon such as data, API, request, POST, etc., although it is safe to assume users are reasonably technical.
- Once you've written helper text, go through it and remove any unnecessary words. Space on screen is at a premium.
- When referring to fields in helper text, use Title Case for the field name and surround it in quotes. For example, Make sure you enter something for 'That Field' too.

## Services & Methods

- Methods should, wherever possible, use the verbs New (for triggers, as in New Email), Add, Update, Get and Delete.
- When naming a trigger, use the form New Object. When naming actions, use the form Add an Object or Get an Object etc.
- List methods alphabetically by object first (e.g. all Activities together, then Books, etc..), then by verb (Add, Update, Get, Delete).

## Input Fields

- Always have Object ID at the top of the set of fields and named in that form, rather than just ID.
- Next, display Name and Description type fields.
- Only use helper text where it adds something. Don't have a field called Description with helper text Please provide a description.
- It's more important to be selective about which inputs to offer than with outputs. In general, all the fields that the user sees on screen when creating an object through the app's UI should be available through Flow XO.
- Make sure input fields are consistent across all of the service's methods.

## Output Fields

- Always have the object's ID (and any other important ID's) at the top of the list. The ID should be labelled in the format Object ID.
- We're not too worried about having quite a lot of output fields, so include everything that might be useful to the average user. Anything too technical or very API specific, we can leave out. Just apply common sense and don't think too hard about this.
- Make sure output fields are consistent across all of the service's methods.

## Validating Input

- Dates should be validated and converted into an ISO 8601 date (or whatever date format the API expects) with Moment.js. If they fail conversion, return a helpful error.
- Other than dates, input should generally by taken as is (helper text should be used to explain the expected format) and the API's error messages used to feedback any problems to the user. If the API doesn't provide adequate feedback and it affects the user experience, we always have the option of doing extra validation.

## Errors

- The idea of the error message is simply to pass on all the information and knowledge we have about why a request failed. That can be from the API response, or from our understanding of how the API works. If we know something that could help the user and we don't tell them, we're failing!
- Most API's will provide details of 1) why the request failed and 2) the fields that might need to be fixed (for validation errors). Try to parse and pass on this information to the user in our own error message.
- If an API only gives a HTTP status code, try to create a message that's relevant to the API/method. For example, if we get a 404 go with something like We couldn't find that invoice. Please check the ID is correct.
- Make sure error messages are consistent across all of the service's methods.