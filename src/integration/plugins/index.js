/* eslint-disable no-use-before-define */
const fs = require('fs')
const path = require('path')
const log = require('../logging')('integration:plugins')

const container = []

const loadFile = async (pluginPath) => {
  // temp hack to not load test files as plugins
  if (!pluginPath.endsWith('.test.js') && pluginPath.endsWith('.js')) {
    if (!require.cache[pluginPath]) {
      log.info(`loading plugin: ${pluginPath}`)
      // eslint-disable-next-line import/no-dynamic-require
      return require(pluginPath)(container)
    }
    log.info(`plugin already loaded: ${pluginPath}`)
  }

  return Promise.resolve()
}

const loadDirectory = async (pluginPath) => {
  log.info(`loading directory: ${pluginPath}`)
  const entries = fs.readdirSync(pluginPath)
  const promises = entries
    .map((entry) => path.join(pluginPath, entry))
    .map((entryPath) => loadFromPath(entryPath))

  return Promise.all(promises)
}

const loadFromPath = async (pluginPath) => {
  const stat = fs.lstatSync(pluginPath)
  if (stat.isDirectory()) {
    return loadDirectory(pluginPath)
  }

  return loadFile(pluginPath)
}

module.exports.load = async ({ location }) => {
  try {
    log.info(`loading plugins from ${location}`)
    const resolvedPath = path.join(__dirname, location)
    log.info(`resolved path is ${resolvedPath}`)
    await loadFromPath(resolvedPath)
  } catch (err) {
    log.error('error loading plugins', err)
  }

  return container
}
