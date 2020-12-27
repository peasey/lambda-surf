const scheduleParser = require('../aws/cloudwatch/rules/schedule-parser')

const pluginsLocation = process.env.TASKS_LOCATION

module.exports.context = {
  plugins: require('../plugins'),
}

module.exports.tasks = async () => {
  try {
    const tasks = await module.exports.context.plugins.load({
      location: pluginsLocation,
    })
    return tasks.map((task) => {
      const mutated = { ...task }
      mutated.schedule = scheduleParser.parse({ schedule: task.schedule })
      return mutated
    })
    // eslint-disable-next-line no-empty
  } catch (err) {}

  return []
}
