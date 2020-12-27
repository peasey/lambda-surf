require('dotenv').config()
const fetch = require('node-fetch')
const log = require('../logging')('integration:slack:notifier')

const endpoint = process.env.SLACK_ENDPOINT

function concatMap(arr, fn) {
  return [].concat.apply([], arr.map(fn))
}

function intersperse(arr, el) {
  return concatMap(arr, (x) => [el, x]).slice(1)
}

const createMessage = (summaries) => {
  const message = {
    blocks: [],
  }

  const toBlock = (summary) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: summary.text,
    },
  })

  const blocks = summaries.map(toBlock)

  const divider = {
    type: 'divider',
  }

  message.blocks = intersperse(blocks, divider)

  return message
}

const createNotificationForSuccess = (successes) => {
  const toSummary = (success) => ({
    text: `<${success.task.url}|${success.task.name}>\n${success.task.emoji} ${success.result}`,
  })
  const summarised = successes.map(toSummary)
  return createMessage(summarised)
}

const createNotificationForFailure = (failures) => {
  const emoji = ':exclamation:'
  const toSummary = (failure) => ({
    text: `<${failure.task.url}|${failure.task.name}>\n${emoji} ${failure.result}`,
  })
  const summarised = failures.map(toSummary)
  return createMessage(summarised)
}

const sendNotification = async (message) => {
  log.info(`sending slack message...`)

  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(message),
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.ok) {
    log.info(`slack message sent.`)
    return true
  }

  log.error(`${response.status}: ${response.statusText}`)
  log.error(`${await response.text()}`)
  return false
}

const sendSuccessfulTaskNotification = async (successes = []) => {
  if (successes.length > 0) {
    log.info(`creating notification for sucesses...`)
    const notification = createNotificationForSuccess(successes)
    return sendNotification(notification)
  }

  return true
}

const sendFailedTaskNotification = async (failures = []) => {
  if (failures.length > 0) {
    log.info(`creating notification for failures...`)
    const notification = createNotificationForFailure(failures)
    return sendNotification(notification)
  }

  return true
}

module.exports = {
  sendSuccessfulTaskNotification,
  sendFailedTaskNotification,
}
