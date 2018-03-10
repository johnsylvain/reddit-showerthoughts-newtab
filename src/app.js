import { extend, addHours } from './utils'
import { h, createElement } from './vdom'
import { Storage } from './storage'

function App () {
  this.view = document.getElementById('view')
  this.themeToggle = document.getElementById('theme-toggle')

  this.state = {
    thought: undefined,
    theme: 'light',
    cache: undefined
  }

  this.loadState()
    .then(persitedState => {
      if (persitedState) {
        extend(this.state, persitedState)
        this.switchThemes(persitedState.theme, true)
        this.getThought(persitedState.cache)
      } else {
        this.getThought()
      }
    })
  
  this.themeToggle.addEventListener('click', () => {
    this.switchThemes(
      (this.state.theme === 'dark') ? 'light' : 'dark'
    )
  })
}

extend(
  App.prototype,
  Object.create(Storage.prototype)
)

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

  setState (state) {
    extend(this.state, state)
    this.saveState(this.state)
    this.render()
  },

  getThought (cache) {
    const assignThought = thoughts => {
      return thoughts[Math.floor(Math.random() * thoughts.length)]
    }

    if (
      (cache && new Date() <= new Date(this.state.cache.expiration)) ||
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

  switchThemes (newTheme, isInitialization) {
    document.body.className = ''
    document.body.classList.add(newTheme)

    if (isInitialization) return

    this.setState({
      theme: newTheme
    })
  }
})

new App()
