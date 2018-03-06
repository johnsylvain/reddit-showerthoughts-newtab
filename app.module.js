function extend (obj, props) {
  for (let i in props) obj[i] = props[i]
  return obj
}

function addHours (date, h) {
  var copiedDate = new Date(date.getTime())
  copiedDate.setHours(copiedDate.getHours() + h)
  return copiedDate
}

const noop = () => {}

function h (nodeName, attributes, ...children) {
  attributes = attributes || {}
  children = [].concat.apply([], children)

  return { nodeName, attributes, children }
}

function createElement (vnode) {
  let node = typeof vnode === 'string'
    ? document.createTextNode(vnode)
    : document.createElement(vnode.nodeName)

  if (!vnode.attributes) return node

  for (let name in vnode.attributes)
    node.setAttribute(
      name === 'className' ? 'class' : name,
      vnode.attributes[name]
    )

  vnode.children
    .map(createElement)
    .forEach(node.appendChild.bind(node))

  return node
}

function App () {
  this.view = document.getElementById('view')
  this.themeToggle = document.getElementById('theme-toggle')

  this.state = {
    thought: null,
    theme: 'light',
    cachedPosts: undefined
  }
}

extend(App.prototype, Storage.prototype)

extend(App.prototype, {
  constructor () {
    this.loadState()
      .then(persitedState => {
        if (persitedState) {
          this.state.theme = persitedState.theme
          // this.switchThemes(persitedState.theme, true)
          this.state.cachedPosts = persitedState.cachedPosts
          this.getThought(true)
        } else {
          this.getThought(false)
        }
      })

    this.themeToggle.addEventListener('click', function(event) {
      var newTheme = (this.state.theme === 'dark') ? 'light' : 'dark'
      // this.switchThemes(newTheme)
      this.render()
    })
  },

  render () {
    const vnodes = (
      h('div', { id: 'app', className: this.state.theme },
        h('div', { id: 'showerthought'},
          h('blockquote', null,
            h('span', { className: 'quote' }, '&#8220;'),
            h('a', { href: this.state.thought.link }, this.state.thought.post),
            h('span', { className: 'quote' }, '&#8221;')
          ),
          h('p', null, '&#8212; ' + this.state.thought.author)
        )
      )
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

  getThought (cachedThoughts) {
    const getAndRender = (t) => {
      var thought = t[Math.floor(Math.random() * t.length)]
      this.setState({
        thought: {
          post: thought.post,
          author: `u/${thought.author}`,
          link: `http://reddit.com${thought.permalink}`
        }
      })
    }

    if (
      (cachedThoughts &&
      new Date() <= new Date(this.state.cachedPosts.expirationCacheTime)) ||
      !navigator.onLine
    ) {
      getAndRender(this.state.cachedPosts.data)
    } else {
      this.fetchData()
        .then(res => {
          this.state.cachedPosts = {
            data: res,
            expirationCacheTime: addHours(new Date(), 1)
          }
          getAndRender(this.state.cachedPosts.data)
        })
        .catch(noop)
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
      .catch(noop)
  },

  // switchThemes (newTheme, onLoad) {
  //   // this.appEl.className = ''
  //   // this.appEl.classList.add(newTheme)

  //   if (onLoad) return

  //   this.state.theme = newTheme

  //   this.saveState(Object.assign({}, this.state, {
  //     theme: newTheme
  //   }))
  // },

})


function Storage () {
  this.state = null
}

extend(Storage.prototype, {
  loadState () {
    return new Promise((resolve, reject) => {
      return chrome.storage.local.get('state', result => {
        if (result.state) {
          var unserliazedState = JSON.parse(result.state)
          if (unserliazedState !== undefined) {
            resolve(unserliazedState)
          }

        } else {
          resolve(undefined)
        }
      })
    })
  },

  saveState (state) {
    try {
      const serializedState = JSON.stringify(state)
      chrome.storage.local.set({ 'state': serializedState })
      if (chrome.runtime.lastError) {
        noop()
      }
    } catch (e) {
      noop()
    }
  }
})