// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
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

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
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

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({7:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
exports.addHours = addHours;
function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

function addHours(date, h) {
  var copiedDate = new Date(date.getTime());
  copiedDate.setHours(copiedDate.getHours() + h);
  return copiedDate;
}
},{}],8:[function(require,module,exports) {
'use strict';

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
  }return {
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
  }vnode.children.map(createElement).forEach(node.appendChild.bind(node));

  return node;
}
},{}],9:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Storage = Storage;

var _utils = require('./utils');

function Storage() {
  this.__state__ = {};
}

(0, _utils.extend)(Storage.prototype, {
  loadState: function loadState() {
    return this.__state__ ? Promise.resolve(this.__state__) : new Promise(function (resolve, reject) {
      var state = window.localStorage.getItem('state');
      if (state) {
        var unserliazedState = JSON.parse(state);
        if (unserliazedState !== undefined) {
          resolve(unserliazedState);
        }
      } else {
        resolve(undefined);
      }
    });
  },
  saveState: function saveState(state) {
    try {
      this.__state__ = (0, _utils.extend)({}, state);
      var serializedState = JSON.stringify(this.__state__);
      window.localStorage.setItem('state', serializedState);
    } catch (e) {}
  }
});
},{"./utils":7}],5:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = App;

var _utils = require('./utils');

var _vdom = require('./vdom');

var _storage = require('./storage');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var themes = ['light', 'dark', 'nice'];

function App() {
  var _this = this;

  this.storage = Object.create(_storage.Storage.prototype);
  this.view = document.getElementById('view');
  this.state = {
    thought: undefined,
    themeIndex: 0,
    cache: undefined
  };

  this.storage.loadState().then(function (persitedState) {
    if (persitedState) {
      (0, _utils.extend)(_this.state, persitedState);
      _this.cycleThemes(persitedState.themeIndex);
      _this.getThought(persitedState.cache);
    } else {
      _this.getThought();
    }
  });

  document.getElementById('theme-toggle').addEventListener('click', function () {
    _this.cycleThemes();
  });
}

(0, _utils.extend)(App.prototype, {
  render: function render() {
    var vnodes = (0, _vdom.h)(
      'div',
      { id: 'app' },
      (0, _vdom.h)(
        'div',
        { id: 'showerthought' },
        (0, _vdom.h)(
          'blockquote',
          null,
          (0, _vdom.h)(
            'span',
            { className: 'quote' },
            '\u201C'
          ),
          (0, _vdom.h)(
            'a',
            { href: 'http://reddit.com' + this.state.thought.permalink },
            this.state.thought.post
          ),
          (0, _vdom.h)(
            'span',
            { className: 'quote' },
            '\u201D'
          )
        ),
        (0, _vdom.h)(
          'p',
          null,
          '\u2014 ',
          'u/' + this.state.thought.author
        )
      )
    );

    while (this.view.firstChild) {
      this.view.removeChild(this.view.firstChild);
    }this.view.appendChild((0, _vdom.createElement)(vnodes));
  },
  setState: function setState(state, bypassRender) {
    (0, _utils.extend)(this.state, state);
    this.storage.saveState(this.state);
    if (!bypassRender) this.render();
  },
  getThought: function getThought(cache) {
    var _this2 = this;

    var assignThought = function assignThought(thoughts) {
      return thoughts[Math.floor(Math.random() * thoughts.length)];
    };

    if (cache && new Date() <= new Date(this.state.cache.expiration) || !navigator.onLine) {
      this.setState({
        thought: assignThought(cache.posts)
      });
    } else {
      this.fetchData().then(function (res) {
        _this2.setState({
          cache: {
            posts: res,
            expiration: (0, _utils.addHours)(new Date(), 1)
          },
          thought: assignThought(res)
        });
      });
    }
  },
  fetchData: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var res, json, data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=300');

            case 2:
              res = _context.sent;
              _context.next = 5;
              return res.json();

            case 5:
              json = _context.sent;
              data = json.data.children.map(function (_ref2) {
                var _ref2$data = _ref2.data,
                    post = _ref2$data.post,
                    author = _ref2$data.author,
                    permalink = _ref2$data.permalink;
                return {
                  post: post,
                  author: author,
                  permalink: permalink
                };
              });
              return _context.abrupt('return', Promise.resolve(data));

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function fetchData() {
      return _ref.apply(this, arguments);
    }

    return fetchData;
  }(),
  cycleThemes: function cycleThemes(persistedThemeIndex) {
    var newThemeIndex = persistedThemeIndex || (this.state.themeIndex + 1) % themes.length;
    var newTheme = themes[newThemeIndex];
    document.body.className = '';
    document.body.classList.add(newTheme);

    this.setState({
      themeIndex: newThemeIndex
    }, true);
  }
});
},{"./utils":7,"./vdom":8,"./storage":9}],3:[function(require,module,exports) {
'use strict';

var _app = require('./app');

new _app.App();
},{"./app":5}],10:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '62307' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
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
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
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
        parents.push(+k);
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
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[10,3])
//# sourceMappingURL=10dcc488e7878085df068a75980ac9e7.map