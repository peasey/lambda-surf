describe('integration:tasks:plugin-task-provider', () => {
  describe('tasks', () => {
    it('will return an empty list if there is a problem loading the plugins', async () => {
      const subject = require('./plugin-task-provider')
      subject.context = {
        plugins: {
          load: () => {
            throw new Error('Some error')
          },
        },
      }
      const actual = await subject.tasks()
      expect(actual).not.toBeNull()
      expect(actual).toHaveLength(0)
    })
    it('will return a list of tasks when configured correctly', async () => {
      const subject = require('./plugin-task-provider')
      subject.context = {
        plugins: {
          load: () => [{}, {}],
        },
      }
      const actual = await subject.tasks()
      expect(actual).not.toBeNull()
      expect(actual).toHaveLength(2)
    })
  })
})
