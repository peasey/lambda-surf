const createTasks = (number) =>
  Array.from({ length: number }, (_, i) => ({
    name: `Task${i + 1}`,
    schedule: 'rate(1 minute)',
    run: async () => {},
  }))

const createCotext = (allTasks, tasksToRun, ruleName, rule) => ({
  log: require('../../logging')('unit:test'),
  taskProvider: {
    tasks: () => allTasks,
  },
  taskFilter: () => ({
    schedule: () => ({
      select: () => tasksToRun,
    }),
  }),
  resourceParser: {
    parse: () => ruleName,
  },
  rules: {
    byName: () => rule,
  },
  runner: {
    run: jest.fn(),
  },
})

const createInvocationEvent = () => ({
  version: '0',
  id: 'b51b8500-faef-9de2-e010-fe93732fed87',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  account: '1234567890',
  time: '2020-01-01:00:00Z',
  region: 'eu-west-1',
  resources: ['arn:aws:events:eu-west-1:123456789:rule/rule-name'],
  detail: {},
})

describe('integration:aws:lambda:host', () => {
  describe('handler', () => {
    it('will return an incompleted status when it has not run to completion', async () => {
      const subject = require('./host')
      subject.context = {} // empty context will cause and unexpected error
      const actual = await subject.handler(createInvocationEvent())
      expect(actual).toEqual({
        completed: false,
      })
    })

    it('will return an incompleted status when an invocation rule cannot be found', async () => {
      const subject = require('./host')
      subject.context = createCotext([], [], 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      subject.context.resourceParser = {
        parse: () => null,
      }
      const actual = await subject.handler(createInvocationEvent())
      expect(actual).toEqual({
        completed: false,
      })
    })

    it('will return an incompleted status when an invocation schedule cannot be parsed', async () => {
      const subject = require('./host')
      subject.context = createCotext([], [], 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      subject.context.rules = {
        byName: () => null,
      }
      const actual = await subject.handler(createInvocationEvent())
      expect(actual).toEqual({
        completed: false,
      })
    })

    it('will return an incompleted status when no tasks are run', async () => {
      const subject = require('./host')
      subject.context = createCotext([], [], 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      const actual = await subject.handler(createInvocationEvent())
      expect(actual).toEqual({
        completed: false,
      })
    })

    it('will return results of tasks that ran (all succeed)', async () => {
      const subject = require('./host')
      const allTasks = createTasks(10)
      const tasksToRun = allTasks.slice(5)
      subject.context = createCotext(allTasks, tasksToRun, 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      subject.context.runner.run = async () =>
        Promise.resolve({
          run: tasksToRun.length,
          succeeded: tasksToRun,
          failed: [],
        })
      const actual = await subject.handler(createInvocationEvent())
      expect(actual.completed).toEqual(true)
      expect(actual.tasks.total).toEqual(10)
      expect(actual.tasks.run).toEqual(5)
      expect(actual.tasks.succeeded).toHaveLength(5)
      expect(actual.tasks.failed).toHaveLength(0)
    })

    it('will return results of tasks that ran (some fail)', async () => {
      const subject = require('./host')
      const allTasks = createTasks(10)
      const tasksToRun = allTasks.slice(5)
      tasksToRun[0].run = () => {
        throw new Error('First failure')
      }
      tasksToRun[2].run = () => {
        throw new Error('Second failure')
      }
      subject.context = createCotext(allTasks, tasksToRun, 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      subject.context.runner.run = async () =>
        Promise.resolve({
          run: tasksToRun.length,
          succeeded: [tasksToRun[1], tasksToRun[3], tasksToRun[4]],
          failed: [tasksToRun[0], tasksToRun[2]],
        })
      const actual = await subject.handler(createInvocationEvent())
      expect(actual.completed).toEqual(true)
      expect(actual.tasks.total).toEqual(10)
      expect(actual.tasks.run).toEqual(5)
      expect(actual.tasks.succeeded).toHaveLength(3)
      expect(actual.tasks.failed).toHaveLength(2)
    })

    it('will return results of tasks that ran (all fail)', async () => {
      const subject = require('./host')
      const allTasks = createTasks(10)
      const tasksToRun = allTasks.slice(8)
      tasksToRun[0].run = () => {
        throw new Error('First failure')
      }
      tasksToRun[1].run = () => {
        throw new Error('Second failure')
      }
      subject.context = createCotext(allTasks, tasksToRun, 'testRule', {
        schedule: {
          type: 'rate',
          unit: 'minutes',
          value: 5,
        },
      })
      subject.context.runner.run = async () =>
        Promise.resolve({
          run: tasksToRun.length,
          succeeded: [],
          failed: tasksToRun,
        })
      const actual = await subject.handler(createInvocationEvent())
      expect(actual.completed).toEqual(true)
      expect(actual.tasks.total).toEqual(10)
      expect(actual.tasks.run).toEqual(2)
      expect(actual.tasks.succeeded).toHaveLength(0)
      expect(actual.tasks.failed).toHaveLength(2)
    })
  })
})
