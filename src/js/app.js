import { extend, addHours, pluck } from './utils';
import { h, createElement } from './vdom';
import { Storage } from './storage';

const themes = {
  color: ['light', 'dark', 'blue', 'wine', 'pink', 'green'],
  font: ['serif', 'sans-serif', 'round']
};

export function App() {
  this.storage = Object.create(Storage.prototype);
  this.view = document.getElementById('view');
  this.state = {
    thought: undefined,
    theme: {
      color: 0,
      font: 0
    },
    cache: undefined
  };

  const persitedState = this.storage.loadState();

  if (persitedState) {
    extend(this.state, persitedState);
    this.cycle('color', persitedState);
  }

  this.getThought();

  window.addEventListener('click', e => {
    if (e.target.id === 'theme-toggle') {
      this.cycle('color');
    }

    if (e.target.id === 'font-toggle') {
      this.cycle('font');
    }
  });
}

extend(App.prototype, {
  render() {
    const vnodes = (
      <div id="app">
        <div id="showerthought">
          <blockquote>
            <span className="quote">&#8220;</span>
            <a href={`http://reddit.com${this.state.thought.permalink}`}>
              {this.state.thought.post}
            </a>
            <span className="quote">&#8221;</span>
          </blockquote>
          <p>&#8212; {`u/${this.state.thought.author}`}</p>
        </div>
      </div>
    );

    while (this.view.firstChild) this.view.removeChild(this.view.firstChild);

    this.view.appendChild(createElement(vnodes));
  },

  setState(state, bypassRender) {
    extend(this.state, state);
    this.storage.saveState(this.state);
    if (!bypassRender) this.render();
  },

  getThought() {
    if (
      (this.state.cache &&
        new Date() <= new Date(this.state.cache.expiration)) ||
      !navigator.onLine
    ) {
      this.setState({
        thought: pluck(this.state.cache.posts)
      });
    } else {
      this.fetchData().then(res => {
        this.setState({
          cache: {
            posts: res,
            expiration: addHours(new Date(), 1)
          },
          thought: pluck(res)
        });
      });
    }
  },

  fetchData() {
    return fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=300')
      .then(res => res.json())
      .then(json => {
        const data = json.data.children
          .filter(post => !post.data.stickied)
          .map(({ data: { title, author, permalink } }) => ({
            post: title,
            author,
            permalink
          }));
        return Promise.resolve(data);
      });
  },

  cycle(type, persitedState) {
    if (persitedState && typeof persitedState.theme === 'string') {
      persitedState = undefined;
    }

    const newThemeIndex = persitedState
      ? persitedState.theme[type]
      : (this.state.theme[type] + 1) % themes[type].length;

    this.setState(
      {
        theme: Object.assign({}, this.state.theme, {
          [type]: newThemeIndex
        })
      },
      true
    );

    document.body.className = '';
    document.body.classList.add(themes.color[this.state.theme.color]);
    document.body.classList.add(themes.font[this.state.theme.font]);
  }
});
