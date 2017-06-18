function App() {
  this.thought = null
  this.view = document.getElementById('view');
  this.appEl = document.getElementById('app');
  this.themeToggles = document.getElementsByClassName('theme-toggles')
  this.mainTmpl = 'main_tmpl'
  this.cache = {};
  this.state = {
    theme: 'light'
  }
}

App.prototype.init = function () {
  var vm = this;

  this.getThought();

  let persitedState = this.loadState()

  if (persitedState) {
    this.state.theme = persitedState.theme
    this.switchThemes(this.state.theme)
  }

  Array.from(this.themeToggles).forEach(function(toggle) {
    toggle.addEventListener('click', function(event) {
      vm.switchThemes(event.target.getAttribute('data-theme'))
    })
  })
};

App.prototype.getThought = function() {
  var vm = this;

  fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=600')
    .then(function(data) {
      return data.json()
    })
    .then(function(res) {
      var thought = res.data.children[Math.floor(Math.random() * res.data.children.length)];
      vm.thought = {
        post: thought.data.title,
        author: '/u/' + thought.data.author
      }
      vm.view.innerHTML = vm.renderView(vm.mainTmpl, vm.thought)
    })

}

App.prototype.renderView = function (str, data) {
  var fn = !/\W/.test(str) ?
    this.cache[str] = this.cache[str] ||
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

App.prototype.switchThemes = function (newTheme) {
  this.appEl.className = '';
  this.appEl.classList.add(newTheme);
  this.saveState({
    theme: newTheme
  })
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
