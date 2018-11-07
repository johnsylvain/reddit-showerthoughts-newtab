import { extend } from './utils';

export function Storage() {
  this.__state__ = {};
}

extend(Storage.prototype, {
  loadState() {
    if (this.__state__) return this.__state__;

    const state = window.localStorage.getItem('state');

    if (state) {
      var unserliazedState = JSON.parse(state);
      if (unserliazedState !== undefined) {
        return unserliazedState;
      }
    } else {
      return undefined;
    }
  },

  saveState(state) {
    try {
      this.__state__ = extend({}, state);
      const serializedState = JSON.stringify(this.__state__);
      window.localStorage.setItem('state', serializedState);
    } catch (e) {}
  }
});
