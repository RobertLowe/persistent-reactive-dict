
import { ReactiveDict } from 'meteor/reactive-dict'

export class PersistentReactiveDict extends ReactiveDict {
  dictName: string;
  mode: any;
  psKeys: {};
  psKeyList: {};
  psaKeys: {};
  psaKeyList: {};


  constructor() {
    super(...arguments);

    // persisted keys
    this.psKeys = {};
    this.psKeyList = [];

    // authenicated keys
    this.psaKeys = {};
    this.psaKeyList = [];

    if ((typeof arguments[0] === 'string') && (arguments[0].length > 0)) {
      this.dictName = arguments[0];
    } else {
      // No back-compat support: https://github.com/meteor/meteor/blob/devel/packages/reactive-dict/reactive-dict.js#L23-L26
      throw new Error("Invalid PersistentReactiveDict argument: '" + arguments[0] + "'");
    }

    if ((arguments[1] === 'temporary') || (arguments[1] === 'persistent') || (arguments[1] === 'authenticated')) {
      this.mode = arguments[1];
    } else {
      if (arguments[1] === undefined) {
        // default to 'persistent' if not provided
        this.mode = 'persistent';
      } else {
        throw new Error("Invalid PersistentReactiveDict mode: '" + arguments[0] + "', must be one of: ['temporary', 'persistent', 'authenticated']");
      }
    }


    // load values from store
    this.load();

    // on logout attempt to clear
    Tracker.autorun(() => {
      if ((Meteor.userId !== undefined) && !Meteor.userId) {
        return this.clearAuth();
      }
    });


  }

  load() {
    // persistent data
    const psList = amplify.store(`__${this.dictName}_PSKEYS__`);
    if ((typeof psList === 'object') && (psList.length !== undefined)) {
      _.each(psList, (key: any, i: any)=> {
        if (!_.has(this.keys, key)) {
          const val = this.get(key);
          return this.set(key, val, true, false);
        }
      });
    }

    // authenticated data
    const psaList = amplify.store(`__${this.dictName}_PSAKEYS__`);
    if ((typeof psaList === 'object') && (psaList.length !== undefined)) {
      return _.each(psaList, (key: any, i: any)=> {
        if (!_.has(this.keys, key)) {
          const val = this.get(key);
          return this.setAuth(key, val, true, false);
        }
      });
    }
  }
  keys(keys: any, key: any) {
    throw new Error("Method not implemented.");
  }

  // amplify storage adapter
  store(type: string, key: string | number, value: null){
    this.psKeyList  = amplify.store(`__${this.dictName}_PSKEYS__`) || [];
    this.psaKeyList = amplify.store(`__${this.dictName}_PSAKEYS__`) || [];
    this.psKeys  = this.psKeys || [];
    this.psaKeys  = this.psaKeys || [];

    if (type === 'get') {
      return amplify.store(`__${this.dictName}_${key}__`);
    } else {
      this.psKeyList = _.without(this.psKeyList, key);
      this.psaKeyList = _.without(this.psaKeyList, key);
      delete this.psKeys[key];
      delete this.psaKeys[key];
      if ((value === undefined) || (value === null) || (type === 'temporary')) {
        value = null;
      } else if (type === 'persistent') {
        this.psKeys[key] = EJSON.stringify(value);
        this.psKeyList = _.union(this.psKeyList, [ key ]);
      } else if (type === 'authenticated') {
        this.psaKeys[key] = EJSON.stringify(value);
        this.psaKeyList = _.union(this.psaKeyList, [ key ]);
      }
      amplify.store(`__${this.dictName}_PSKEYS__`, this.psKeyList);
      amplify.store(`__${this.dictName}_PSAKEYS__`, this.psaKeyList);
      amplify.store(`__${this.dictName}_${key}__`, value);
    }
  }

  get(key: any){
    const val = super.get(key);
    const psVal = this.store('get', key);

    if (psVal === undefined) {
      return val;
    }

    return psVal;
  }

  set(key: string, value: any, persist: boolean, auth: boolean){
    super.set(key, value);
    let type = 'temporary';
    if (persist || ((persist === undefined) && ((this.mode === 'persistent') || (this.mode === 'authenticated')))) {
      if (auth || ((persist === undefined) && (auth === undefined) && (this.mode === 'authenticated'))) {
        type = 'authenticated';
      } else {
        type = 'persistent';
      }
    }
    return this.store(type, key, value);
  }

  setTemporary(key: any, value: any){
    return this.setTemp(key, value);
  }
  setTemp(key: any, value: any){
    return this.set(key, value, false, false);
  }

  setPersist(key: any, value: any){
    return this.setPersist(key, value);
  }
  setPersistent(key: any, value: any){
    return this.set(key, value, true, false);
  }

  setAuthenticated(key: any, value: any){
    return this.setAuth(key, value);
  }
  setAuth(key: any, value: any){
    return this.set(key, value, true, true);
  }

  makeTemporary(key: any){
    return this.makeTemp(key);
  }
  makeTemp(key: any){
    return this.store('temporary', key);
  }

  makePersistent(key: any){
    return this.makePersist(key);
  }
  makePersist(key: any){
    const val = this.get(key);
    return this.store('persistent', key, val);
  }

  makeAuthenticated(key: any){
    return this.makeAuth(key);
  }
  makeAuth(key: any){
    const val = this.get(key);
    return this.store('authenticated', key, val);
  }

  clear(key: any, list: any){
    // remove all keys with clear();
    if (key === undefined) {
      if (list === undefined) {
        list = this.keys;
      }
      for (let k in list) {
        this.set(k, undefined, false, false);
      }
      // remove a single key with clear('key');
    } else {
      this.set(key, undefined, false, false);
    }

  }

  clearTemporary() {
    return this.clearTemp();
  }
  clearTemp() {
    return this.clear(undefined, _.keys(_.omit(this.keys, this.psKeys, this.psaKeys)));
  }

  clearPersistent() {
    return this.clearPersist();
  }
  clearPersist() {
    return this.clear(undefined, this.psKeys);
  }

  clearAuthenticated() {
    return this.clearAuth();
  }
  clearAuth() {
    return this.clear(undefined, this.psaKeys);
  }

  update(key: any, value: any){
    let persist = undefined;
    let auth = undefined;
    if (_.indexOf(this.psaKeyList, key) >= 0) {
      auth = true;
    }
    if (auth || (_.indexOf(this.psKeyList, key) >= 0)) {
      persist = true;
    }
    return this.set(key, value, persist, auth);
  }

  setDefault(key: any, value: any, persist: boolean, auth: boolean){
    if (this.get(key) === undefined) {
      return this.set(key, value, persist, auth);
    }
  }

  setDefaultTemporary(key: any, value: any){
    return this.setDefaultTemp(key, value);
  }
  setDefaultTemp(key: any, value: any){
    return this.setDefault(key, value, false, false);
  }

  setDefaultPersistent(key: any, value: any){
    return this.setDefaultPersist(key, value);
  }
  setDefaultPersist(key: any, value: any){
    return this.setDefault(key, value, true, false);
  }

  setDefaultAuthenticated(key: any, value: any){
    return this.setDefaultAuth(key, value);
  }
  setDefaultAuth(key: any, value: any){
    return this.setDefault(key, value, true, true);
  }
}
