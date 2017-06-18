function App() {
  this.thought = null
  this.view = document.getElementById('view');
}

App.prototype.getThought = function() {
  var vm = this;

  // mock api request
  setTimeout(function() {
    vm.thought = {
      post: "nice",
      author: "/u/username"
    }
    vm.renderView()
  }, 1000)
}

App.prototype.renderView = function () {
  this.view.innerHTML = JSON.stringify(this.thought, null, ' ');
};

var app = new App();
app.getThought();
