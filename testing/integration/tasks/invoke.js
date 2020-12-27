require('dotenv').config()
const host = require('../../../src/integration/aws/lambda/host')
const scheduleParser = require('../../../src/integration/aws/cloudwatch/rules/schedule-parser')

const run = async () => {
  const event = {
    id: 'cdc73f9d-aea9-11e3-9d5a-835b769c0d9c',
    'detail-type': 'Scheduled Event',
    source: 'aws.events',
    account: '123456789012',
    time: '1970-01-01T00:00:00Z',
    region: 'eu-west-1',
    resources: ['dummy'],
    detail: {},
  }

  host.context.resourceParser = {
    parse: () => 'dummy',
  }

  host.context.rules = {
    byName: async () => ({
      schedule: scheduleParser.parse({ schedule: process.argv[2] }),
    }),
  }

  const result = await host.handler(event)
  console.info(result)
}

run().then()
