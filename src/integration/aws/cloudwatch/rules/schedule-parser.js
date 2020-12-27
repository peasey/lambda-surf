module.exports.parse = ({ schedule = '' } = {}) => {
  const matches = schedule.match(/(.*)\((\d*) (.*)\)/)
  if (matches && matches.length >= 4) {
    if (matches[1] === 'rate') {
      return {
        type: 'rate',
        unit: matches[3],
        value: parseInt(matches[2], 10),
      }
    }
  }

  return null
}
