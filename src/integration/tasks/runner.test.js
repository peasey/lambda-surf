describe('integration:tasks:runner', () => {
  it('returns an empty result set when initialised without any tasks', async () => {
    const subject = require('./runner')
    const expected = {
      run: 0,
      succeeded: [],
      failed: [],
    }
    const actual = await subject.run()
    expect(actual).toMatchObject(expected)
  })

  it('returns all successful results when all tasks run successfuly', async () => {
    const tasks = [
      {
        name: 'Task 1',
        shouldNotify: () => true,
        run: () => 'Task 1 data',
      },
      {
        name: 'Task 2',
        shouldNotify: () => true,
        run: () => 'Task 2 data',
      },
      {
        name: 'Task 3',
        shouldNotify: () => true,
        run: () => 'Task 3 data',
      },
    ]
    const subject = require('./runner')
    const expected = {
      run: tasks.length,
      succeeded: tasks.map((task) => ({
        task,
        result: `${task.name} data`,
      })),
      failed: [],
    }
    const actual = await subject.run({ tasks })
    expect(actual).toMatchObject(expected)
  })

  it('returns all failed results when all tasks fail to run successfuly', async () => {
    const tasks = [
      {
        name: 'Task 1',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Task 1 error')
        },
      },
      {
        name: 'Task 2',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Task 2 error')
        },
      },
      {
        name: 'Task 3',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Task 3 error')
        },
      },
    ]
    const subject = require('./runner')
    const expected = {
      run: tasks.length,
      failed: tasks.map((task) => ({
        task,
        result: new Error(`${task.name} error`),
      })),
      succeeded: [],
    }
    const actual = await subject.run({ tasks })
    expect(actual).toMatchObject(expected)
  })

  it('returns partial failed results when some tasks fail to run successfuly', async () => {
    const tasks = [
      {
        name: 'Task 1',
        shouldNotify: () => true,
        run: () => 'Task 1 data',
      },
      {
        name: 'Task 2',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Task 2 error')
        },
      },
      {
        name: 'Task 3',
        shouldNotify: () => true,
        run: () => 'Task 3 data',
      },
    ]
    const subject = require('./runner')
    const expected = {
      run: tasks.length,
      failed: [
        {
          task: tasks[1],
          result: new Error(`Task 2 error`),
        },
      ],
      succeeded: [
        {
          task: tasks[0],
          result: 'Task 1 data',
        },
        {
          task: tasks[2],
          result: 'Task 3 data',
        },
      ],
    }
    const actual = await subject.run({ tasks })
    expect(actual).toMatchObject(expected)
  })

  it('will only send notifications for tasks that require it', async () => {
    const tasks = [
      {
        name: 'Task 1',
        shouldNotify: () => true,
        run: () => 'Task 1 data',
      },
      {
        name: 'Task 2',
        shouldNotify: () => false,
        run: () => 'Task 2 data',
      },
      {
        name: 'Task 3',
        shouldNotify: () => true,
        run: () => 'Task 3 data',
      },
    ]
    const subject = require('./runner')
    const notifier = {
      sendSuccessfulTaskNotification: jest.fn(),
      sendFailedTaskNotification: jest.fn(),
    }
    await subject.run({ tasks, notifier })
    expect(notifier.sendFailedTaskNotification).toHaveBeenCalledTimes(0)
    expect(notifier.sendSuccessfulTaskNotification).toHaveBeenCalledTimes(1)
    expect(notifier.sendSuccessfulTaskNotification).toHaveBeenCalledWith(expect.toBeArrayOfSize(2))
  })

  it('will only send notifications for failed tasks that require it', async () => {
    const tasks = [
      {
        name: 'Task 1',
        shouldNotify: () => false,
        run: () => {
          throw new Error('First failure')
        },
      },
      {
        name: 'Task 2',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Second failure')
        },
      },
      {
        name: 'Task 3',
        shouldNotify: () => true,
        run: () => {
          throw new Error('Third failure')
        },
      },
    ]
    const subject = require('./runner')
    const notifier = {
      sendSuccessfulTaskNotification: jest.fn(),
      sendFailedTaskNotification: jest.fn(),
    }
    await subject.run({ tasks, notifier })
    expect(notifier.sendSuccessfulTaskNotification).toHaveBeenCalledTimes(0)
    expect(notifier.sendFailedTaskNotification).toHaveBeenCalledTimes(1)
    expect(notifier.sendFailedTaskNotification).toHaveBeenCalledWith(expect.toBeArrayOfSize(2))
  })
})
