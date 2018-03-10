export function extend (obj, props) {
  for (let i in props) obj[i] = props[i]
  return obj
}

export function addHours (date, h) {
  var copiedDate = new Date(date.getTime())
  copiedDate.setHours(copiedDate.getHours() + h)
  return copiedDate
}

export const noop = () => {}
