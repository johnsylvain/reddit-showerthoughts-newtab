require=function(r,e,n){function t(n,o){function i(r){return t(i.resolve(r))}function f(e){return r[n][1][e]||e}if(!e[n]){if(!r[n]){var c="function"==typeof require&&require;if(!o&&c)return c(n,!0);if(u)return u(n,!0);var l=new Error("Cannot find module '"+n+"'");throw l.code="MODULE_NOT_FOUND",l}i.resolve=f;var s=e[n]=new t.Module(n);r[n][0].call(s.exports,i,s,s.exports)}return e[n].exports}function o(r){this.id=r,this.bundle=t,this.exports={}}var u="function"==typeof require&&require;t.isParcelRequire=!0,t.Module=o,t.modules=r,t.cache=e,t.parent=u;for(var i=0;i<n.length;i++)t(n[i]);return t}({12:[function(require,module,exports) {
"use strict";function e(e,r){for(var t in r)e[t]=r[t];return e}function r(e,r){var t=new Date(e.getTime());return t.setHours(t.getHours()+r),t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.extend=e,exports.addHours=r;
},{}],13:[function(require,module,exports) {
"use strict";function e(e,t){for(var r=[],n=arguments.length;n-- >2;)r.push(arguments[n]);return{nodeName:e,attributes:t||{},children:[].concat.apply([],r.reverse())}}function t(e){var r="string"==typeof e||"number"==typeof e?document.createTextNode(e):document.createElement(e.nodeName);if(!e.attributes)return r;for(var n in e.attributes)r.setAttribute("className"===n?"class":n,e.attributes[n]);return e.children.map(t).forEach(r.appendChild.bind(r)),r}Object.defineProperty(exports,"__esModule",{value:!0}),exports.h=e,exports.createElement=t;
},{}],8:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.App=h;var t=require("./utils"),e=require("./vdom");function h(){var e=this;for(var h in arguments){var i=arguments[h];this[i[0]]=Object.create(i[1].prototype)}this.view=document.getElementById("view"),this.state={thought:void 0,theme:"light",cache:void 0},this.storage.loadState().then(function(h){h?((0,t.extend)(e.state,h),e.switchThemes(h.theme),e.getThought(h.cache)):e.getThought()}),document.getElementById("theme-toggle").addEventListener("click",function(){e.switchThemes("dark"===e.state.theme?"light":"dark")})}(0,t.extend)(h.prototype,{render:function(){for(var t=(0,e.h)("div",{id:"app"},(0,e.h)("div",{id:"showerthought"},(0,e.h)("blockquote",null,(0,e.h)("span",{className:"quote"},"“"),(0,e.h)("a",{href:"http://reddit.com"+this.state.thought.permalink},this.state.thought.post),(0,e.h)("span",{className:"quote"},"”")),(0,e.h)("p",null,"— ","u/"+this.state.thought.author)));this.view.firstChild;)this.view.removeChild(this.view.firstChild);this.view.appendChild((0,e.createElement)(t))},setState:function(e,h){(0,t.extend)(this.state,e),this.storage.saveState(this.state),h||this.render()},getThought:function(e){var h=this,i=function(t){return t[Math.floor(Math.random()*t.length)]};e&&new Date<=new Date(this.state.cache.expiration)||!navigator.onLine?this.setState({thought:i(e.posts)}):this.fetchData().then(function(e){h.setState({cache:{posts:e,expiration:(0,t.addHours)(new Date,1)},thought:i(e)})})},fetchData:function(){return fetch("https://www.reddit.com/r/showerthoughts/hot.json?limit=300").then(function(t){return t.json()}).then(function(t){var e=t.data.children.map(function(t){return{post:t.data.title,author:t.data.author,permalink:t.data.permalink}});return Promise.resolve(e)})},switchThemes:function(t){document.body.className="",document.body.classList.add(t),this.setState({theme:t},!0)}});
},{"./utils":12,"./vdom":13}],9:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Storage=e;var t=require("./utils");function e(t){this.__state__=t||{}}(0,t.extend)(e.prototype,{loadState:function(t){return t||this.__state__?Promise.resolve(this.__state__):new Promise(function(t,e){var s=window.localStorage.getItem("state");if(s){var a=JSON.parse(s);void 0!==a&&t(a)}else t(void 0)})},saveState:function(e){try{this.__state__=(0,t.extend)({},e);var s=JSON.stringify(this.__state__);window.localStorage.setItem("state",s)}catch(t){}}});
},{"./utils":12}],6:[function(require,module,exports) {
"use strict";var e=require("./app"),r=require("./storage");new e.App(["storage",r.Storage]);
},{"./app":8,"./storage":9}]},{},[6])