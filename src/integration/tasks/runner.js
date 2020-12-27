const log = require('../logging')('integration:tasks:runner')

const runTasks = async (tasks) => {
  const result = {
    run: 0,
    succeeded: [],
    failed: [],
  }

  const promises = tasks.map(async (task) => {
    try {
      log.info(`running ${task.name} task`)
      result.run += 1
      const taskResult = await task.run()
      result.succeeded.push({ task, result: taskResult })
    } catch (err) {
      log.error(`error running ${task.name} task`, err)
      result.failed.push({ task, result: err })
    }

    return result
  })

  await Promise.all(promises)

  return result
}

const sendNotifications = async (notifier, data) => {
  const shouldNotify = (result) => result.task.shouldNotify(result.result) === true

  const toNotifySuccessful = data.succeeded.filter(shouldNotify)

  if (toNotifySuccessful.length > 0) {
    log.info('sending notification for successful tasks')
    await notifier.sendSuccessfulTaskNotification(toNotifySuccessful)
  }

  const toNotifyFailed = data.failed.filter(shouldNotify)

  if (toNotifyFailed.length > 0) {
    log.info('sending notification for failed tasks')
    await notifier.sendFailedTaskNotification(toNotifyFailed)
  }
}

const run = async ({ tasks = [], notifier = require('../slack/notifier') } = {}) => {
  log.info(`running tasks`)
  const result = await runTasks(tasks)

  log.info(`sending notifications`)
  await sendNotifications(notifier, result)

  return result
}

module.exports.run = run
