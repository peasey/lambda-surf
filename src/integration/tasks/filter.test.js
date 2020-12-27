describe('integration:tasks:filter', () => {
  it('will filter the tasks appropriately using chaining', async () => {
    const tasks = [
      {
        schedule: {
          type: 'rate',
          unit: 'minute',
          value: 1,
        },
      },
      {
        schedule: {
          type: 'rate',
          unit: 'hour',
          value: 1,
        },
      },
      {
        schedule: {
          type: 'cron',
        },
      },
      {
        schedule: {
          type: 'rate',
          unit: 'minute',
          value: 3,
        },
      },
    ]

    const subject = require('./filter')
    const byRate = subject(tasks).rate().select()
    expect(byRate).toHaveLength(3)

    const byUnit = subject(tasks).rate().unit('minute').select()
    expect(byUnit).toHaveLength(2)

    const byValue = subject(tasks).rate().unit('minute').value(1).select()
    expect(byValue).toHaveLength(1)
  })

  it('will filter the tasks based on a schedule', async () => {
    const tasks = [
      {
        schedule: {
          type: 'rate',
          unit: 'minute',
          value: 1,
        },
      },
      {
        schedule: {
          type: 'rate',
          unit: 'hour',
          value: 1,
        },
      },
      {
        schedule: {
          type: 'cron',
        },
      },
      {
        schedule: {
          type: 'rate',
          unit: 'minute',
          value: 3,
        },
      },
    ]

    const subject = require('./filter')
    const bySchedule = subject(tasks)
      .schedule({
        type: 'rate',
        unit: 'hour',
        value: 1,
      })
      .select()
    expect(bySchedule).toHaveLength(1)
  })
})
