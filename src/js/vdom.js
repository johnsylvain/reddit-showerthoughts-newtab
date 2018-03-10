export function h (nodeName, attributes, ...children) {
  attributes = attributes || {}
  children = [].concat.apply([], children)

  return { nodeName, attributes, children }
}

export function createElement (vnode) {
  let node = typeof vnode === 'string' || typeof vnode === 'number'
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
