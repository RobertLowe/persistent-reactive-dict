Package.describe({
  name: "robertlowe:persistent-reactive-dict",
  version: "1.0.0",
  summary: "PersistentReactiveDict implements persistence for a ReactiveDict",
  git: "https://github.com/robertlowe/persistent-reactive-dict"
});

Package.onUse(function (api, where) {
  api.versionsFrom('1.8');

  api.use('underscore');
  api.use('jquery');
  api.use('tracker');
  api.use('ejson');
  api.use('reactive-dict');
  api.use('typescript');

  api.addFiles('amplify.js', 'client');

  api.mainModule('persistent-reactive-dict.ts');

});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('underscore');
  api.use('typescript');
  api.use('robertlowe:persistent-reactive-dict');

  // more tests are need, but multiple sessions/reloads are required, just sanity for now
  api.addFiles('tests.ts', 'client');
});