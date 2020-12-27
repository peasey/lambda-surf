module.exports.parse = ({ resource = '' } = {}) => {
  const matches = resource.match(/(.*)\/(.*)/)
  if (matches && matches.length === 3) {
    return matches[2]
  }

  return null
}
