@PersistentReactiveDict = class PersistentReactiveDict extends ReactiveDict


  constructor: ->
    if (typeof arguments[0] == 'string' && arguments[0].length > 0)
      @dictName = arguments[0]
    else
      # No back-compat support: https://github.com/meteor/meteor/blob/devel/packages/reactive-dict/reactive-dict.js#L23-L26
      throw new Error("Invalid PersistentReactiveDict argument: '" + arguments[0] + "'")

    if (arguments[1] == 'temporary' || arguments[1] == 'persistent' || arguments[1] == 'authenticated')
      @mode = arguments[1]
    else
      if arguments[1] is undefined
        # default to 'persistent' if not provided
        @mode = 'persistent'
      else
        throw new Error("Invalid PersistentReactiveDict mode: '" + arguments[0] + "', must be one of: ['temporary', 'persistent', 'authenticated']")

    super

    # persisted keys
    @psKeys = {}
    @psKeyList = []

    # authenicated keys
    @psaKeys = {}
    @psaKeyList = []

    # load values from store
    @load()

    # on logout attempt to clear
    Tracker.autorun =>
      if Meteor.userId isnt undefined && !Meteor.userId
        @clearAuth()

  load: ->
    # persistent data
    psList = amplify.store("__#{@dictName}_PSKEYS__")
    if typeof psList == 'object' and psList.length != undefined
      _.each psList, (key, i)=>
        if !_.has(@keys, key)
          val = @get(key)
          @set key, val, true, false

    # authenticated data
    psaList = amplify.store("__#{@dictName}_PSAKEYS__")
    if typeof psaList == 'object' and psaList.length != undefined
      _.each psaList, (key, i)=>
        if !_.has(@keys, key)
          val = @get(key)
          @setAuth key, val, true, false

  # amplify storage adapter
  store: (type, key, value)->
    @psKeyList  = amplify.store("__#{@dictName}_PSKEYS__") or []
    @psaKeyList = amplify.store("__#{@dictName}_PSAKEYS__") or []

    if type == 'get'
      return amplify.store("__#{@dictName}_#{key}__")
    else
      @psKeyList = _.without(@psKeyList, key)
      @psaKeyList = _.without(@psaKeyList, key)
      delete @psKeys[key]
      delete @psaKeys[key]
      if value == undefined or value == null or type == 'temporary'
        value = null
      else if type == 'persistent'
        @psKeys[key] = EJSON.stringify(value)
        @psKeyList = _.union(@psKeyList, [ key ])
      else if type == 'authenticated'
        @psaKeys[key] = EJSON.stringify(value)
        @psaKeyList = _.union(@psaKeyList, [ key ])
      amplify.store "__#{@dictName}_PSKEYS__", @psKeyList
      amplify.store "__#{@dictName}_PSAKEYS__", @psaKeyList
      amplify.store "__#{@dictName}_#{key}__", value
    return

  get: (key)->
    val = super(key)
    psVal = @store('get', key)

    if psVal == undefined
      return val

    psVal

  set: (key, value, persist, auth)->
    super key, value
    type = 'temporary'
    if persist or persist == undefined and (@mode == 'persistent' or @mode == 'authenticated')
      if auth or persist == undefined and auth == undefined and @mode == 'authenticated'
        type = 'authenticated'
      else
        type = 'persistent'
    @store type, key, value

  setTemporary: (key, value)->
    @setTemp key, value
  setTemp: (key, value)->
    @set key, value, false, false

  setPersist: (key, value)->
    @setPersist key, value
  setPersistent: (key, value)->
    @set key, value, true, false

  setAuthenticated: (key, value)->
    @setAuth key, value
  setAuth: (key, value)->
    @set key, value, true, true

  makeTemporary: (key)->
    @makeTemp(key)
  makeTemp: (key)->
    @store 'temporary', key

  makePersistent: (key)->
    @makePersist(key)
  makePersist: (key)->
    val = @get(key)
    @store 'persistent', key, val

  makeAuthenticated: (key)->
    @makeAuth(key)
  makeAuth: (key)->
    val = @get(key)
    @store 'authenticated', key, val

  clear: (key, list)->
    # remove all keys with clear();
    if key == undefined
      if list == undefined
        list = @keys
      for k of list
        @set k, undefined, false, false
      # remove a single key with clear('key');
    else
      @set key, undefined, false, false

    return

  clearTemporary: ->
    @clearTemp()
  clearTemp: ->
    @clear undefined, _.keys(_.omit(@keys, @psKeys, @psaKeys))

  clearPersistent: ->
    @clearPersist()
  clearPersist: ->
    @clear undefined, @psKeys

  clearAuthenticated: ->
    @clearAuth()
  clearAuth: ->
    @clear undefined, @psaKeys

  update: (key, value)->
    persist = undefined
    auth = undefined
    if _.indexOf(@psaKeyList, key) >= 0
      auth = true
    if auth or _.indexOf(@psKeyList, key) >= 0
      persist = true
    @set key, value, persist, auth

  setDefault: (key, value, persist, auth)->
    if @get(key) == undefined
      @set key, value, persist, auth

  setDefaultTemporary: (key, value)->
    @setDefaultTemp(key, value)
  setDefaultTemp: (key, value)->
    @setDefault key, value, false, false

  setDefaultPersistent: (key, value)->
    @setDefaultPersist(key, value)
  setDefaultPersist: (key, value)->
    @setDefault key, value, true, false

  setDefaultAuthenticated: (key, value)->
    @setDefaultAuth(key, value)
  setDefaultAuth: (key, value)->
    @setDefault key, value, true, true
