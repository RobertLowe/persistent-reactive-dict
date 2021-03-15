import { PersistentReactiveDict } from 'meteor/robertlowe:persistent-reactive-dict';

const thing = new PersistentReactiveDict('thing', 'temporary');
const stuff = new PersistentReactiveDict('stuff', 'temporary');

Tinytest.add("defaults persistent", function(test: { equal: (arg0: string, arg1: any) => any; }){
  const foo = new PersistentReactiveDict('foofoofoo1234124');
  return test.equal('persistent', foo.mode);
});

Tinytest.add("alternate mode", function(test: { equal: (arg0: string, arg1: any) => any; }){
  const foo = new PersistentReactiveDict('barbarbar1234124', 'authenticated');
  return test.equal('authenticated', foo.mode);
});

Tinytest.add("gets undefined", function(test: { equal: (arg0: any, arg1: any) => void; }){

  let result = thing.get('something');
  test.equal(undefined, result);

  result = stuff.get('something');
  return test.equal(undefined, result);
});

Tinytest.add("sets & gets", function(test: { equal: (arg0: string, arg1: any) => void; }){

  let result = thing.set('something', 'awesome');
  test.equal(undefined, result);
  result = thing.get('something');
  test.equal('awesome', result);

  result = stuff.set('something', 'amazing');
  test.equal(undefined, result);
  result = stuff.get('something');
  test.equal('amazing', result);

  result = thing.get('something');
  return test.equal('awesome', result);
});

Tinytest.add("clear", function(test: { equal: (arg0: string, arg1: any) => void; }){

  // set/get
  let result = thing.set('different', 'awesome');
  test.equal(undefined, result);
  result = thing.get('different');
  test.equal('awesome', result);

  result = stuff.set('different', 'amazing');
  test.equal(undefined, result);
  result = stuff.get('different');
  test.equal('amazing', result);

  result = thing.get('something');
  test.equal('awesome', result);

  // clears
  result = thing.clear('different');
  test.equal(undefined, result);
  result = thing.get('different');
  test.equal(undefined, result);

  // didnt mess up stuff
  result = stuff.get('different');
  return test.equal('amazing', result);
});

