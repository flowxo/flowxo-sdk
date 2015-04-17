// Used to check if the SDK dependencies have been installed yet.
try {
  require('inquirer');
} catch(e) {
  throw new Error('Could not find SDK dependencies. Did you remember to run `grunt init`?');
}
