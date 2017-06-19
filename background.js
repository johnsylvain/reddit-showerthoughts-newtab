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
  var vm = this;

  var persitedState = this.loadState();

  if (persitedState) {
    this.state.theme = persitedState.theme;
    this.switchThemes(persitedState.theme, true)

    this.state.cachedPosts = persitedState.cachedPosts
    this.getThought(true)

  } else {
    this.getThought(false);
  }

  this.themeToggle.addEventListener('click', function(event) {
    var newTheme = (vm.state.theme === 'dark') ? 'light' : 'dark'
    vm.switchThemes(newTheme)
  })

};

App.prototype.getThought = function(cachedThoughts) {
  var vm = this;

  function getAndRender(t) {
    var thought = t[Math.floor(Math.random() * t.length)];
    vm.thought = {
      post: thought.post,
      author: '/u/' + thought.author,
      link: 'http://reddit.com' + thought.permalink
    }
    vm.view.innerHTML = vm.renderView('main_tmpl', vm.thought)
  }

  if ((cachedThoughts &&
    new Date() <= new Date(vm.state.cachedPosts.expirationCacheTime)) ||
    !navigator.onLine
  ) {
    getAndRender(vm.state.cachedPosts.data)
  } else {

    fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=300')
      .then(function(data) {
        return data.json()
      })
      .then(function(res) {
        vm.state.cachedPosts = {
          data: res.data.children.map(function(post) {
            return {
              post: post.data.title,
              author: post.data.author,
              permalink: post.data.permalink
            }
          }),
          expirationCacheTime: new Date().addHours(1)
        };

        getAndRender(vm.state.cachedPosts.data);
        vm.saveState(vm.state)
      })
  }


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
  try {
    const serializedState = window.localStorage.getItem('state');
    if(serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
};

App.prototype.saveState = function (state) {
  try {
    const serializedState = JSON.stringify(state);
    window.localStorage.setItem('state', serializedState)
  } catch (e) {
    // ignore
  }
};

var app = new App();
app.init();
