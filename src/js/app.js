import { extend, addHours } from './utils'
import { h, createElement } from './vdom'
import { Storage } from './storage'

export function App () {
  this.storage = Object.create(Storage.prototype)
  this.view = document.getElementById('view')
  this.state = {
    thought: undefined,
    theme: 'light',
    cache: undefined
  }

  this.storage.loadState()
    .then(persitedState => {
      if (persitedState) {
        extend(this.state, persitedState)
        this.switchThemes(persitedState.theme)
        this.getThought(persitedState.cache)
      } else {
        this.getThought()
      }
    })

  document.getElementById('theme-toggle')
    .addEventListener('click', () => {
      this.switchThemes(
        (this.state.theme === 'dark') ? 'light' : 'dark'
      )
    })
}

extend(App.prototype, {
  render () {
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
    )

    while (this.view.firstChild)
      this.view.removeChild(this.view.firstChild)

    this.view.appendChild(createElement(vnodes))
  },

  setState (state, bypassRender) {
    extend(this.state, state)
    this.storage.saveState(this.state)
    if (!bypassRender) this.render()
  },

  getThought (cache) {
    const assignThought = thoughts => 
      thoughts[Math.floor(Math.random() * thoughts.length)]

    if (
      cache &&
      new Date() <= new Date(this.state.cache.expiration) ||
      !navigator.onLine
    ) {
      this.setState({
        thought: assignThought(cache.posts)
      })
    } else {
      this.fetchData()
        .then(res => {
          this.setState({
            cache: {
              posts: res,
              expiration: addHours(new Date(), 1)
            },
            thought: assignThought(res)
          })
        })
    }
  },

  fetchData () {
    return fetch('https://www.reddit.com/r/showerthoughts/hot.json?limit=300')
      .then(res => res.json())
      .then(json => {
        const data = json.data.children
          .map(post => ({
            post: post.data.title,
            author: post.data.author,
            permalink: post.data.permalink
          }))
        return Promise.resolve(data)
      })
  },

  switchThemes (newTheme) {
    document.body.className = ''
    document.body.classList.add(newTheme)

    this.setState({
      theme: newTheme
    }, true)
  }
})
