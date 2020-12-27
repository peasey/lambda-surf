module.exports.context = {
  log: require('../../logging')('integration:aws:lambda:host'),
  taskProvider: require('../../tasks/plugin-task-provider'),
  taskFilter: require('../../tasks/filter'),
  resourceParser: require('./resource-parser'),
  rules: require('../cloudwatch/rules'),
  runner: require('../../tasks/runner'),
}

module.exports.handler = async (event) => {
  const result = {
    completed: false,
  }

  try {
    const { log, resourceParser, rules, taskProvider, taskFilter, runner } = module.exports.context

    log.info(`event: ${JSON.stringify(event)}`)
    log.info('host running')
    log.info('parsing invocation event rule')

    const ruleName = resourceParser.parse({ resource: event.resources[0] })
    if (ruleName) {
      const rule = await rules.byName({ name: ruleName })
      if (rule) {
        log.info(
          `invocation schedule is ${rule.schedule.type}(${rule.schedule.value} ${rule.schedule.unit})`,
        )
        log.info('loading tasks')
        const tasks = await taskProvider.tasks()
        if (tasks.length > 0) {
          log.info(`loaded ${tasks.length} tasks`)
          const scheduledTasks = taskFilter(tasks).schedule(rule.schedule).select()
          log.info(`running ${scheduledTasks.length} scheduled tasks`)
          result.tasks = await runner.run({ tasks: scheduledTasks })
          result.tasks.total = tasks.length
          result.completed = true
          log.info('done')
        }
      } else {
        log.info('could not parse the schedule')
      }
    } else {
      log.info('could not find an invocation rule')
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('unexpected error running host', err)
  }

  return result
}
