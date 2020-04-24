const M = {
  of: function (value) {
    const m = {
      toString: function () {
        return value
      },
      SUCCESS: value + '_SUCCESS',
      FAILURE: value + '_FAILURE'
    }
    return m
  }
}

const isCancel = (value) => !!(value && value.__CANCEL__)

const begin = (loadingField, errorField, func = Function.prototype) => state => {
  state[loadingField] = true
  state[errorField] = null
  func(state)
}

function nil (key) {
  return (state) => {
    state[key] = null
  }
}

const success = (loadingField, resultField, errorField = false) => (state, payload = null) => {
  state[loadingField] = false
  if (errorField) {
    state[errorField] = null
  }

  if (resultField.call) {
    resultField(state, payload)
  } else {
    state[resultField] = payload
  }
}

const silence = (loadingField) => (state) => {
  state[loadingField] = false
}

const error = (loadingField, errorField, func = Function.prototype) => (state, err) => {
  state[loadingField] = false
  state[errorField] = err
  func(state)
}

const poll = (type, func) => async (context, request) => {
  try {
    const response = await func(request)
    context.commit(`${type}_SUCCESS`, response.data)
    return response
  } catch (err) {
    context.commit(`${type}_FAILURE`, err)
    throw err
  }
}

function removeById(loadingField, name) {
  return success(loadingField, (state, argument) => {
    const index = state[name].findIndex(each => each.id === argument.id)
    state[name].splice(index, 1)
  })
}

function unshift(loadingField, name) {
  return success(loadingField, (state, argument) => state[name].unshift(argument))
}

function push(loadingField, name) {
  return success(loadingField, (state, argument) => state[name].push(argument))
}

const query = (type, call) => async (context, request) => {
  try {
    context.commit(type.toString())
    const response = await call(request)
    context.commit(`${type}_SUCCESS`, response.data)
    return response
  } catch (err) {
    if (!isCancel(err)) {
      context.commit(`${type}_FAILURE`, err)
    }
    throw err
  }
}

const cached = (type, call, moduleName, modulePath) => {
  const action = query(type, call)
  return async (context, request) => {
    const founded = context.rootState[moduleName][modulePath].find(each => each.id == request.id)

    if (founded) {
      context.commit(`${type}_SUCCESS`, founded)
      return { data: founded }
    }

    return action(context, request)
  } 
}

function commit(event) {
  return ({ commit }, obj) => commit(event, obj)
}

const execute = (loadingField, resultField, func) => (state) => {
  state[loadingField] = false
  state[resultField] = func()
}

function route (path, component, options = {}) {
  return {
    path,
    component,
    ...options
  }
}

function prefix (path, routes) {
  return routes.map(route => {
    route.path = path + route.path
    return route
  })
}

function set (field) {
  return (state, result) => {
    state[field] = result
  }
}

function assign (loadingField, field) {
  if (!field) {
    return (state, result) => {
      state[loadingField] = Object.assign({}, state[loadingField], result)
    }
  }
  return success(loadingField, (state, result) => {
    state[field] = Object.assign({}, state[field], result)
  })
}

module.exports = {
  begin,
  success,
  error,
  query,
  removeById,
  poll,
  push,
  cached,
  commit,
  silence,
  execute,
  route,
  prefix,
  set,
  assign,
  unshift,
  nil,
  M
}
