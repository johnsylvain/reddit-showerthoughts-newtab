function App() {
  this.thought = null
  this.view = document.getElementById('view');
  this.appEl = document.getElementById('app');
  this.themeToggle = document.getElementById('theme-toggle')

  this.tmplCache = {};
  this.state = {
    theme: 'light',
    cachedPosts: undefined
  }
}

Date.prototype.addHours= function(h){
    var copiedDate = new Date(this.getTime());
    copiedDate.setHours(copiedDate.getHours()+h);
    return copiedDate;
}

App.prototype.init = function () {
  var _this = this;

  this.loadState()
  .then(function(persitedState) {
    if (persitedState) {
      _this.state.theme = persitedState.theme;
      _this.switchThemes(persitedState.theme, true)

      _this.state.cachedPosts = persitedState.cachedPosts
      _this.getThought(true)

    } else {
      _this.getThought(false);
    }
  });

  this.themeToggle.addEventListener('click', function(event) {
    var newTheme = (_this.state.theme === 'dark') ? 'light' : 'dark'
    _this.switchThemes(newTheme)
  })

};

App.prototype.getThought = function(cachedThoughts) {
  var _this = this;

  function getAndRender(t) {
    var thought = t[Math.floor(Math.random() * t.length)];
    _this.thought = {
      post: thought.post,
      author: 'u/' + thought.author,
      link: 'http://reddit.com' + thought.permalink
    }
    _this.view.innerHTML = _this.renderView('main_tmpl', _this.thought)
  }

  if ((cachedThoughts &&
    new Date() <= new Date(_this.state.cachedPosts.expirationCacheTime)) ||
    !navigator.onLine
  ) {
    getAndRender(_this.state.cachedPosts.data)
  } else {
    _this.fetchData('https://www.reddit.com/r/showerthoughts/hot.json?limit=300')
    .then(function (res) {
      _this.state.cachedPosts = {
        data: res,
        expirationCacheTime: new Date().addHours(1)
      };
      getAndRender(_this.state.cachedPosts.data);
      _this.saveState(_this.state);
    })
    .catch(function (err) {
      throw new Error(err);
    })
  }
}

App.prototype.fetchData = function (url) {
  return new Promise(function (resolve, reject) {
    if (url) {
      fetch(url)
      .then(function(data) {
        return data.json()
      })
      .then(function(res) {
        var data = res.data.children.map(function(post) {
          return {
            post: post.data.title,
            author: post.data.author,
            permalink: post.data.permalink
          }
        })
        resolve(data);
      })
      .catch(function() {
        reject('Could not fetch data.');
      })
    } else {
      reject('url should not be undefined, empty or null.');
    }
  });
}

App.prototype.renderView = function (str, data) {
  var fn = !/\W/.test(str) ?
    this.tmplCache[str] = this.tmplCache[str] ||
      this.renderView(document.getElementById(str).innerHTML) :
    new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +
      "with(obj){p.push('" +
      str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
    + "');}return p.join('');");

  return data ? fn( data ) : fn;
};

App.prototype.switchThemes = function (newTheme, onLoad) {
  this.appEl.className = '';
  this.appEl.classList.add(newTheme);

  if (onLoad) return

  this.state.theme = newTheme;

  this.saveState(Object.assign({}, this.state, {
    theme: newTheme
  }));
};

App.prototype.loadState = function () {
  return new Promise(function(resolve, reject) {
    return chrome.storage.local.get('state', function(result) {
      if (result.state) {
        var unserliazedState = JSON.parse(result.state)
        if (unserliazedState !== undefined) {
          resolve(unserliazedState)
        }

      } else {
        resolve(undefined)
      }
    });
  });
};

App.prototype.saveState = function (state) {
  try {
    var serializedState = JSON.stringify(state);
    chrome.storage.local.set({'state': serializedState})
    if (chrome.runtime.lastError) {
        // ignore for now
    }
  } catch (e) {
    // ignore
  }
};
