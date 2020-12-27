'use strict'

const _ = require('lodash')

class ServerlessPlugin {
  constructor(
    serverless,
    options,
    taskProvider = require('../../src/integration/tasks/plugin-task-provider'),
  ) {
    this.serverless = serverless
    this.options = options
    this.taskProvider = taskProvider

    this.hooks = {
      'before:package:initialize': this.addScheduledEvents.bind(this),
    }
  }

  async addScheduledEvents() {
    const tasks = await this.taskProvider.tasks()
    const schedules = tasks.map((task) => task.schedule)
    const uniqueSchedules = _.uniqBy(schedules, (item) => `${item.type}_${item.unit}_${item.value}`)

    this.serverless.cli.log(
      `got ${uniqueSchedules.length} unique schedules from ${tasks.length} tasks`,
    )

    const functionNames = this.serverless.service.getAllFunctions()
    functionNames.map((functionName) => {
      const fn = this.serverless.service.getFunction(functionName)
      fn.events = uniqueSchedules.map((uniqueSchedule) => ({
        schedule: `${uniqueSchedule.type}(${uniqueSchedule.value} ${uniqueSchedule.unit})`,
      }))
      this.serverless.cli.log(
        `added ${fn.events
          .map((event) => event.schedule)
          .join(',')} events to ${functionName} function`,
      )
    })
  }
}

module.exports = ServerlessPlugin
