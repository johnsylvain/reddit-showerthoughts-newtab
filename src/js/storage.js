import { extend } from './utils'

export function Storage () {
  this.__state__ = {}
}

extend(Storage.prototype, {
  loadState () {
    return (this.__state__)
      ? Promise.resolve(this.__state__)
      : new Promise((resolve, reject) => {
          const state = window.localStorage.getItem('state')
          if (state) {
            var unserliazedState = JSON.parse(state)
            if (unserliazedState !== undefined) {
              resolve(unserliazedState)
            }
          } else {
            resolve(undefined)
          }
        })
  },

  saveState (state) {
    try {
      this.__state__ = extend({}, state)
      const serializedState = JSON.stringify(this.__state__)
      window.localStorage.setItem('state', serializedState)
    } catch (e) {}
  }
})
