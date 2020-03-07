export const begin = (loadingField, errorField, func = Function.prototype) => state => {
  state[loadingField] = true
  state[errorField] = null
  func(state)
}

export const success = (loadingField, resultField) => (state, payload = null) => {
  state[loadingField] = false

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
    context.commit(type)
    const { data: response } = await func(request)
    context.commit(`${type}_SUCCESS`, response)
    return response
  } catch (err) {
    context.commit(`${type}_FAILURE`, err)
    throw err
  }
}

export const poll = (type, func) => async (context, request) => {
  try {
    const { data: response } = await func(request)
    context.commit(`${type}_SUCCESS`, response)
    return response
  } catch (err) {
    context.commit(`${type}_FAILURE`, err)
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

export const cached = (type, call, moduleName, modulePath) => async (context, request) => {
  const founded = context.rootState[moduleName][modulePath].find(each => each.id == request.id)

  if (founded) {
    context.commit(`${type}_SUCCESS`, founded)
    return founded
  }

  try {
    context.commit(type)
    const { data: response } = await call(request)
    context.commit(`${type}_SUCCESS`, response)
    return response
  } catch (err) {
    context.commit(`${type}_FAILURE`, err)
    throw err
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