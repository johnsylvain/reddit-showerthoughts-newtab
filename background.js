function App() {
  this.thought = null
  this.view = document.getElementById('view');
  this.mainTmpl = 'main_tmpl'
  this.cache = {};
}

App.prototype.init = function () {
  this.getThought();
};

App.prototype.getThought = function() {
  var vm = this;

  fetch('https://www.reddit.com/r/showerthoughts/hot.json')
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

var app = new App();
app.init();
