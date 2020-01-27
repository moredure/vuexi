const begin = (loadingField, errorField, func = Function.prototype) => state => {
  state[loadingField] = true
  state[errorField] = null
  func(state)
}

const one = (loadingField, resultField) => (state, payload = null) => {
  state[loadingField] = false

  if (resultField.call) {
    resultField(state, payload)
  } else {
    state[resultField] = payload
  }
}

const error = (loadingField, errorField, func = Function.prototype) => (state, err) => {
  state[loadingField] = false
  state[errorField] = err
  func(state)
}

const action = (type, func) => async (context, request) => {
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

function removeById(loadingField, name) {
  return one(loadingField, (state, argument) => {
    const index = state[name].findIndex(each => each.id === argument.id)
    state[name].splice(index, 1)
  })
}

function push(loadingField, name) {
  return one(loadingField, (state, argument) => state[name].push(argument))
}

const cached = (type, call, moduleName, modulePath) => async (context, request) => {
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

function commit(event) {
  return ({ commit }, obj) => commit(event, obj)
}

module.exports = {
  begin,
  one,
  error,
  action,
  removeById,
  push,
  cached,
  commit,
}