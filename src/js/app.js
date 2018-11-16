import { extend, addHours, pluck } from './utils';
import { h, createElement } from './vdom';
import { Storage } from './storage';

const themes = {
  color: ['light', 'dark', 'blue', 'wine', 'pink', 'green'],
  font: ['serif', 'sans-serif', 'round']
};

const storage = new Storage();

export function App() {
  this.view = document.getElementById('view');
  this.state = {
    thought: undefined,
    theme: {
      color: 0,
      font: 0
    },
    cache: undefined
  };

  const persitedState = storage.loadState();

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
              {this.state.thought.title}
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
    storage.saveState(this.state);
    if (!bypassRender) this.render();
  },

  async getThought() {
    const useCache =
      (this.state.cache &&
        new Date() <= new Date(this.state.cache.expiration)) ||
      !navigator.onLine;

    const thoughts = useCache ? this.state.cache.posts : await this.fetchData();

    const newState = { thought: pluck(thoughts) };

    if (!useCache) {
      Object.assign(newState, {
        cache: {
          posts: thoughts,
          expiration: addHours(new Date(), 1)
        }
      });
    }

    this.setState(newState);
  },

  async fetchData() {
    const res = await fetch(
      'https://www.reddit.com/r/showerthoughts/hot.json?limit=300'
    );
    const json = await res.json();

    return json.data.children
      .filter(post => !post.data.stickied)
      .map(({ data: { title, author, permalink } }) => ({
        title,
        author,
        permalink
      }));
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
