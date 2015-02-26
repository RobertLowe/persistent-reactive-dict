Package.describe({
  name: "robertlowe:persistent-reactive-dict",
  version: "0.1.1",
  summary: "PersistentReactiveDict implements persistence for a ReactiveDict",
  git: "https://github.com/robertlowe/persistent-reactive-dict"
});

Package.onUse(function (api, where) {
  api.versionsFrom('1.0.3.1');

  api.use('underscore');
  api.use('jquery');
  api.use('amplify@1.0.0');
  api.use('tracker');
  api.use('ejson');
  api.use('reactive-dict', 'client');
  api.use('coffeescript', 'client');

  api.addFiles('persistent-reactive-dict.coffee', 'client');

  api.export('PersistentReactiveDict', 'client');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('underscore');
  api.use('coffeescript');
  api.use('robertlowe:persistent-reactive-dict');

  // more tests are need, but multiple sessions/reloads are required, just sanity for now
  api.addFiles('tests.coffee', 'client');
});