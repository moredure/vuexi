export const begin = (loadingField, errorField, func = Function.prototype) => state => {
  state[loadingField] = true
  state[errorField] = null
  func(state)
}

export const M = {
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

export function action (m, loadingField, objectField, errorField, func) {
  return {
    [m]: begin(loadingField, errorField),
    [m.SUCCESS]: func(loadingField, objectField, errorField),
    [m.FAILURE]: error(loadingField, errorField)
  }
}

export function nil (key) {
  return (state) => {
    state[key] = null
  }
}

export const success = (loadingField, resultField, errorField = false) => (state, payload = null) => {
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

export const silence = (loadingField) => (state) => {
  state[loadingField] = false
}

export const error = (loadingField, errorField, func = Function.prototype) => (state, err) => {
  state[loadingField] = false
  state[errorField] = err
  func(state)
}

export const query = (type, func) => async (context, request) => {
  try {
    context.commit(type.toString())
    const response = await func(request)
    context.commit(`${type}_SUCCESS`, response.data)
    return response
  } catch (err) {
    if (!isCancel(err)) {
      context.commit(`${type}_FAILURE`, err)
    }
    throw err
  }
}

export const poll = (type, func) => async (context, request) => {
  try {
    const response = await func(request)
    context.commit(`${type}_SUCCESS`, response.data)
    return response
  } catch (err) {
    if (!isCancel(err)) {
      context.commit(`${type}_FAILURE`, err)
    }
    throw err
  }
}

export function removeById(loadingField, name) {
  return success(loadingField, (state, argument) => {
    const index = state[name].findIndex(each => each.id === argument.id)
    state[name].splice(index, 1)
  })
}

export function push(loadingField, name) {
  return success(loadingField, (state, argument) => state[name].push(argument))
}

export function unshift(loadingField, name) {
  return success(loadingField, (state, argument) => state[name].unshift(argument))
}

export const cached = (type, call, moduleName, modulePath) => {
  const action = query(type, call)
  return async (context, request) => {
    const founded = context.rootState[moduleName][modulePath || moduleName].find(each => each.id == request.id)

    if (founded) {
      context.commit(`${type}_SUCCESS`, founded)
      return { data: founded }
    }

    return action(context, request)
  } 
}

export function commit(event) {
  return ({ commit }, obj) => commit(event, obj)
}

export const execute = (loadingField, resultField, func) => (state) => {
  state[loadingField] = false
  state[resultField] = func()
}

export function route (path, component, options = {}) {
  return {
    path,
    component,
    ...options
  }
}

export function prefix (path, routes) {
  return routes.map(route => {
    route.path = path + route.path
    return route
  })
}

export function set (field) {
  return (state, result) => {
    state[field] = result
  }
}

export function assign (loadingField, field) {
  if (!field) {
    return (state, result) => {
      state[loadingField] = Object.assign({}, state[loadingField], result)
    }
  }
  return success(loadingField, (state, result) => {
    state[field] = Object.assign({}, state[field], result)
  })
}

export function assignById (loadingField, name, errorField) {
  return success(loadingField, (state, argument) => {
    const index = state[name].findIndex(each => each.id === argument.id)
    Object.assign(state[name][index], argument)
  }, errorField)
}
