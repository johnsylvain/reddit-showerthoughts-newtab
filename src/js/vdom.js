export function h(nodeName, attributes) {
  let rest = [];
  let length = arguments.length;

  while (length-- > 2) rest.push(arguments[length]);

  return {
    nodeName,
    attributes: attributes || {},
    children: [].concat.apply([], rest.reverse())
  };
}

export function createElement(vnode) {
  const node =
    typeof vnode === 'string' || typeof vnode === 'number'
      ? document.createTextNode(vnode)
      : document.createElement(vnode.nodeName);

  if (!vnode.attributes) return node;

  for (let name in vnode.attributes)
    node.setAttribute(
      name === 'className' ? 'class' : name,
      vnode.attributes[name]
    );

  vnode.children.map(createElement).forEach(node.appendChild.bind(node));

  return node;
}
