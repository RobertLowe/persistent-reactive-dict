Purpose
=======
Make Meteor's `ReactiveDict` object persist its values locally and across page
refreshes. Meteor's default implementation loses values whenever the page is
refreshed.

Uses [amplifyjs's store](http://amplifyjs.com/api/store/) library to save
values in the browsers `localStorage`, falling back to other solutions if it's
not available.

Installation
============
```
meteor add robert-lowe:persistent-reactive-dict
```

```
mySession = new PersistentReactiveDict('mySession')
```

Types
=====

1. Temporary ReactiveDict
  * matches current Meteor implementation
  * are not available after a  page reload

2. Persistent ReactiveDict
  * content is stored in the localstorage until it is cleared

3. Authenticated ReactiveDict
  * content is stored in the localstorage AND is cleared when a user logs out

Usage
=====

Setting ReactiveDict Values
----------------------

* `mySession.set(key, value)`
  * stores a var according to the mode (see Options)
* `mySession.setTemp(key, value)`
  * stores a temporary variable (non-persistent)
* `mySession.setPersistent(key, value)`
  * store a persistent variable (persistent)
* `mySession.setAuth(key, value)`
  * stores a authenticated variable (persistent + automatic deletion)

Updating ReactiveDict Values
-----------------------

You can update the value of an existing variable without changing or knowing its type.
Note: If you call update on an non-existent variable, it will be created as a temporary variable.

* `mySession.update(key, value)`

Set Default
-----------

All of the `set()` functions have a `setDefault()` counterpart where the variable will only be created if one doesn't already exist.
Note: None of the `setDefault()` commands will change the type of an existing variable.

* `mySession.setDefault(key, value)`
* `mySession.setDefaultTemp(key, value)`
* `mySession.setDefaultPersistent(key, value)`
* `mySession.setDefaultAuth(key, value)`

Change Types
------------

Use these commands to change a variable into a particular type.

* `mySession.makeTemp(key)`
* `mySession.makePersistent(key)`
* `mySession.makeAuth(key)`

Clear Values
------------

* `mySession.clear()`
  * destroys all variables of all types
* `mySession.clear(key)`
  * destroys a single variable
* `mySession.clearTemp()`
  * destroys all temporary variables
* `mySession.clearPersistent()`
  * destroys all persistent variables
* `mySession.clearAuth()`
  * destroys all authenticated variables

Other
-----

These work the same as the current Meteor implementation:

* `mySession.get(key)`
* `mySession.equals(key, value)`

Options
=======

The default mode for PersistentReactiveDict is `persistent`, you can change that by providing it as the second option to the constructor

```
temporaryDict = new PersistentReactiveDict('temporaryDict', 'temporary')

persistentDict = new PersistentReactiveDict('persistentDict', 'persistent')

authenticatedDict = new PersistentReactiveDict('authenticatedDict', 'authenticated')
```



Testing
====

`meteor test-packages ./` where ./ is the root of the package directory

TODO
====

* More tests


Credits
====
- [Robert Lowe](https://github.com/robertlowe) - meteor developer and author of `persistent-reactive-dict`
- [okgrow](https://github.com/okgrow) - consultancy and host for [Meteor Code Club](www.meetup.com/Meteor-Code-Club)
- [Richard Gould](https://github.com/rgould) - author of the original `meteor-persistent-session` which most of the code is based on
- [Paul Dowman](https://github.com/pauldowman) - head of okgrow
