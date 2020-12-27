const plugin = require('.')
describe('serverless-plugins:task-schedules', () => {
  it('updates the functions with unique schedules found on the tasks', async () => {
    const tasks = [
      {
        schedule: {
          type: 'rate',
          value: 1,
          unit: 'hour',
        },
      },
      {
        schedule: {
          type: 'rate',
          value: 1,
          unit: 'day',
        },
      },
      {
        schedule: {
          type: 'rate',
          value: 1,
          unit: 'hour',
        },
      },
      {
        schedule: {
          type: 'rate',
          value: 1,
          unit: 'day',
        },
      },
    ]

    const f1 = { name: 'function1' }
    const f2 = { name: 'function1' }

    const subject = new plugin(
      {
        cli: {
          log: (...args) => console.log(...args),
        },
        service: {
          getAllFunctions: () => [f1.name, f2.name],
          getFunction: (name) => {
            if (name === f1.name) return f1

            return f2
          },
        },
      },
      {},
      {
        tasks: async () => Promise.resolve(tasks),
      },
    )
    await subject.addScheduledEvents()
    const expected = [{ schedule: 'rate(1 hour)' }, { schedule: 'rate(1 day)' }]
    expect(f1.events).toMatchObject(expected)
    expect(f1.events).toMatchObject(expected)
  })
})
