import { extend } from './utils'

export function Storage () {
  this.__state__ = {}
}

extend(Storage.prototype, {
  loadState () {
    return (this.__state__)
      ? Promise.resolve(this.__state__)
      : new Promise((resolve, reject) => {
          return chrome.storage.local.get('state', result => {
            if (result.state) {
              var unserliazedState = JSON.parse(result.state)
              if (unserliazedState !== undefined) {
                resolve(unserliazedState)
              }
            } else {
              resolve(undefined)
            }
          })
        })
  },

  saveState (state) {
    this.__state__ = extend({}, state)
    try {
      const serializedState = JSON.stringify(this.__state__)
      chrome.storage.local.set({ state: serializedState })
    } catch (e) {}
  }
})
