const log = require('../../../logging')('integration:aws:cloudwatch:rules')
const scheduleParser = require('./schedule-parser')

const createDefaultClient = () => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const AWS = require('aws-sdk')
  const CloudWatchEvents = new AWS.CloudWatchEvents()
  return CloudWatchEvents
}

const byName = async ({ name = '' } = {}) => {
  try {
    const params = {
      Name: name,
    }
    const rule = await module.exports.client.describeRule(params).promise()
    const schedule = scheduleParser.parse({ schedule: rule.ScheduleExpression })
    if (schedule) {
      return {
        schedule,
        enabled: rule.State === 'ENABLED',
      }
    }
  } catch (err) {
    log.error(`error describing the rule by name '${name}'`, err)
  }

  return null
}

module.exports.byName = byName
module.exports.client = createDefaultClient()
