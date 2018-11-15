// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"js/utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
exports.addHours = addHours;
exports.pluck = pluck;

function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }

  return obj;
}

function addHours(date, h) {
  var copiedDate = new Date(date.getTime());
  copiedDate.setHours(copiedDate.getHours() + h);
  return copiedDate;
}

function pluck(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
},{}],"js/vdom.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.createElement = createElement;

function h(nodeName, attributes) {
  var rest = [];
  var length = arguments.length;

  while (length-- > 2) {
    rest.push(arguments[length]);
  }

  return {
    nodeName: nodeName,
    attributes: attributes || {},
    children: [].concat.apply([], rest.reverse())
  };
}

function createElement(vnode) {
  var node = typeof vnode === 'string' || typeof vnode === 'number' ? document.createTextNode(vnode) : document.createElement(vnode.nodeName);
  if (!vnode.attributes) return node;

  for (var name in vnode.attributes) {
    node.setAttribute(name === 'className' ? 'class' : name, vnode.attributes[name]);
  }

  vnode.children.map(createElement).forEach(node.appendChild.bind(node));
  return node;
}
},{}],"js/storage.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Storage = Storage;

var _utils = require("./utils");

function Storage() {
  this.__state__ = {};
}

(0, _utils.extend)(Storage.prototype, {
  loadState: function loadState() {
    if (this.__state__) return this.__state__;
    var state = window.localStorage.getItem('state');

    if (state) {
      var unserliazedState = JSON.parse(state);

      if (unserliazedState !== undefined) {
        return unserliazedState;
      }
    } else {
      return undefined;
    }
  },
  saveState: function saveState(state) {
    try {
      this.__state__ = (0, _utils.extend)({}, state);
      var serializedState = JSON.stringify(this.__state__);
      window.localStorage.setItem('state', serializedState);
    } catch (e) {}
  }
});
},{"./utils":"js/utils.js"}],"js/app.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = App;

var _utils = require("./utils");

var _vdom = require("./vdom");

var _storage = require("./storage");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var themes = {
  color: ['light', 'dark', 'blue', 'wine', 'pink', 'green'],
  font: ['serif', 'sans-serif', 'round']
};

function App() {
  var _this = this;

  this.storage = Object.create(_storage.Storage.prototype);
  this.view = document.getElementById('view');
  this.state = {
    thought: undefined,
    theme: {
      color: 0,
      font: 0
    },
    cache: undefined
  };
  var persitedState = this.storage.loadState();

  if (persitedState) {
    (0, _utils.extend)(this.state, persitedState);
    this.cycle('color', persitedState);
  }

  this.getThought();
  window.addEventListener('click', function (e) {
    if (e.target.id === 'theme-toggle') {
      _this.cycle('color');
    }

    if (e.target.id === 'font-toggle') {
      _this.cycle('font');
    }
  });
}

(0, _utils.extend)(App.prototype, {
  render: function render() {
    var vnodes = (0, _vdom.h)("div", {
      id: "app"
    }, (0, _vdom.h)("div", {
      id: "showerthought"
    }, (0, _vdom.h)("blockquote", null, (0, _vdom.h)("span", {
      className: "quote"
    }, "\u201C"), (0, _vdom.h)("a", {
      href: "http://reddit.com".concat(this.state.thought.permalink)
    }, this.state.thought.post), (0, _vdom.h)("span", {
      className: "quote"
    }, "\u201D")), (0, _vdom.h)("p", null, "\u2014 ", "u/".concat(this.state.thought.author))));

    while (this.view.firstChild) {
      this.view.removeChild(this.view.firstChild);
    }

    this.view.appendChild((0, _vdom.createElement)(vnodes));
  },
  setState: function setState(state, bypassRender) {
    (0, _utils.extend)(this.state, state);
    this.storage.saveState(this.state);
    if (!bypassRender) this.render();
  },
  getThought: function getThought() {
    var _this2 = this;

    if (this.state.cache && new Date() <= new Date(this.state.cache.expiration) || !navigator.onLine) {
      this.setState({
        thought: (0, _utils.pluck)(this.state.cache.posts)
      });
    } else {
      this.fetchData().then(function (res) {
        _this2.setState({
          cache: {
            posts: res,
            expiration: (0, _utils.addHours)(new Date(), 1)
          },
          thought: (0, _utils.pluck)(res)
        });
      });
    }
  },
  fetchData: function fetchData() {
    return fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=300').then(function (res) {
      return res.json();
    }).then(function (json) {
      var data = json.data.children.filter(function (post) {
        return !post.data.stickied;
      }).map(function (_ref) {
        var _ref$data = _ref.data,
            title = _ref$data.title,
            author = _ref$data.author,
            permalink = _ref$data.permalink;
        return {
          post: title,
          author: author,
          permalink: permalink
        };
      });
      return Promise.resolve(data);
    });
  },
  cycle: function cycle(type, persitedState) {
    if (persitedState && typeof persitedState.theme === 'string') {
      persitedState = undefined;
    }

    var newThemeIndex = persitedState ? persitedState.theme[type] : (this.state.theme[type] + 1) % themes[type].length;
    this.setState({
      theme: Object.assign({}, this.state.theme, _defineProperty({}, type, newThemeIndex))
    }, true);
    document.body.className = '';
    document.body.classList.add(themes.color[this.state.theme.color]);
    document.body.classList.add(themes.font[this.state.theme.font]);
  }
});
},{"./utils":"js/utils.js","./vdom":"js/vdom.js","./storage":"js/storage.js"}],"js/index.js":[function(require,module,exports) {
"use strict";

var _app = require("./app");

new _app.App();
},{"./app":"js/app.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57680" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/index.js"], null)
//# sourceMappingURL=js.00a46daa.map