thing = new PersistentReactiveDict('thing', 'temporary')
stuff = new PersistentReactiveDict('stuff', 'temporary')

Tinytest.add "defaults persistent", (test)->
  foo = new PersistentReactiveDict('foofoofoo1234124')
  test.equal('persistent', foo.mode)

Tinytest.add "alternate mode", (test)->
  foo = new PersistentReactiveDict('barbarbar1234124', 'authenticated')
  test.equal('authenticated', foo.mode)

Tinytest.add "gets undefined", (test)->

  result = thing.get('something')
  test.equal(undefined, result)

  result = stuff.get('something')
  test.equal(undefined, result)

Tinytest.add "sets & gets", (test)->

  result = thing.set('something', 'awesome')
  test.equal(undefined, result)
  result = thing.get('something')
  test.equal('awesome', result)

  result = stuff.set('something', 'amazing')
  test.equal(undefined, result)
  result = stuff.get('something')
  test.equal('amazing', result)

  result = thing.get('something')
  test.equal('awesome', result)

Tinytest.add "clear", (test)->

  # set/get
  result = thing.set('different', 'awesome')
  test.equal(undefined, result)
  result = thing.get('different')
  test.equal('awesome', result)

  result = stuff.set('different', 'amazing')
  test.equal(undefined, result)
  result = stuff.get('different')
  test.equal('amazing', result)

  result = thing.get('something')
  test.equal('awesome', result)

  # clears
  result = thing.clear('different')
  test.equal(undefined, result)
  result = thing.get('different')
  test.equal(undefined, result)

  # didnt mess up stuff
  result = stuff.get('different')
  test.equal('amazing', result)

