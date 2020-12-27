const log = ({ stdout, prefix, message, err }) => {
  /* eslint-disable no-empty */
  try {
    if (err) {
      stdout(`[${prefix}] ${message}`, err)
    } else {
      stdout(`[${prefix}] ${message}`)
    }
  } catch (ignore) {}
}

// eslint-disable-next-line no-console
const logInfo = (prefix) => (message) => log({ stdout: console.info, prefix, message })
// eslint-disable-next-line no-console
const logError = (prefix) => (message, err) => log({ stdout: console.error, prefix, message, err })

const createLogger = (prefix) => ({
  debug: logInfo(prefix),
  info: logInfo(prefix),
  error: logError(prefix),
})

module.exports = createLogger
