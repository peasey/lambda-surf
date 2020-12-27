const fetch = require('node-fetch')

jest.mock('node-fetch', () => jest.fn())

describe('integration:slack:notifier', () => {
  describe('sendSuccessfulTaskNotification', () => {
    it('will send the appropriate content for successes', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a succsess message',
        },
      ]
      fetch.mockImplementation((endpoint, options) => {
        try {
          const body = JSON.parse(options.body)
          expect(body.blocks).toHaveLength(successes.length)
          expect(body.blocks[0].text.text).toMatch(successes[0].task.name)
          expect(body.blocks[0].text.text).toMatch(successes[0].task.url)
          expect(body.blocks[0].text.text).toMatch(successes[0].task.emoji)
          expect(body.blocks[0].text.text).toMatch(successes[0].result)
        } catch (err) {
          done.fail(err)
        }

        return Promise.resolve({
          ok: true,
        })
      })
      const result = await subject.sendSuccessfulTaskNotification(successes)
      expect(result).toBe(true)
      done()
    })

    it('will send the correct number of blocks for the success tasks (including divider)', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a succsess message',
        },
        {
          task: {
            name: 'Task 2',
            emoji: ':test:',
            url: 'http://localhost/test/2',
          },
          result: 'this is a succsess message',
        },
      ]
      fetch.mockImplementation((endpoint, options) => {
        try {
          const body = JSON.parse(options.body)
          expect(body.blocks).toHaveLength(successes.length + 1)
          expect(body.blocks[1].type).toEqual('divider')
        } catch (err) {
          done.fail(err)
        }

        return Promise.resolve({
          ok: true,
        })
      })
      const result = await subject.sendSuccessfulTaskNotification(successes)
      expect(result).toBe(true)
      done()
    })

    it('will return false when there is problem sending the notifications', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a success message',
        },
        {
          task: {
            name: 'Task 2',
            emoji: ':test:',
            url: 'http://localhost/test/2',
          },
          result: 'this is a success message',
        },
      ]
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => 'Some error',
        }),
      )
      const result = await subject.sendSuccessfulTaskNotification(successes)
      expect(result).toBe(false)
      done()
    })

    it('an empty task list will return true but not send a notification', async (done) => {
      const subject = require('./notifier')
      fetch.mockImplementation(() => done.fail())
      const result = await subject.sendSuccessfulTaskNotification()
      expect(result).toBe(true)
      done()
    })
  })

  describe('sendSuccessfulTaskNotification', () => {
    it('will send the appropriate content for failures', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a failure message',
        },
      ]
      fetch.mockImplementation((endpoint, options) => {
        try {
          const body = JSON.parse(options.body)
          expect(body.blocks).toHaveLength(successes.length)
          expect(body.blocks[0].text.text).toMatch(successes[0].task.name)
          expect(body.blocks[0].text.text).toMatch(successes[0].task.url)
          expect(body.blocks[0].text.text).toMatch(':exclamation:')
          expect(body.blocks[0].text.text).toMatch(successes[0].result)
        } catch (err) {
          done.fail(err)
        }

        return Promise.resolve({
          ok: true,
        })
      })
      const result = await subject.sendFailedTaskNotification(successes)
      expect(result).toBe(true)
      done()
    })

    it('will send the correct number of blocks for the failed tasks (including divider)', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a failure message',
        },
        {
          task: {
            name: 'Task 2',
            emoji: ':test:',
            url: 'http://localhost/test/2',
          },
          result: 'this is a failure message',
        },
      ]
      fetch.mockImplementation((endpoint, options) => {
        try {
          const body = JSON.parse(options.body)
          expect(body.blocks).toHaveLength(successes.length + 1)
          expect(body.blocks[1].type).toEqual('divider')
        } catch (err) {
          done.fail(err)
        }

        return Promise.resolve({
          ok: true,
        })
      })
      const result = await subject.sendFailedTaskNotification(successes)
      expect(result).toBe(true)
      done()
    })

    it('will return false when there is problem sending the notifications', async (done) => {
      const subject = require('./notifier')
      const successes = [
        {
          task: {
            name: 'Task 1',
            emoji: ':test:',
            url: 'http://localhost/test/1',
          },
          result: 'this is a failure message',
        },
        {
          task: {
            name: 'Task 2',
            emoji: ':test:',
            url: 'http://localhost/test/2',
          },
          result: 'this is a failure message',
        },
      ]
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => 'Some error',
        }),
      )
      const result = await subject.sendFailedTaskNotification(successes)
      expect(result).toBe(false)
      done()
    })

    it('an empty task list will return true but not send a notification', async (done) => {
      const subject = require('./notifier')
      fetch.mockImplementation(() => done.fail())
      const result = await subject.sendFailedTaskNotification()
      expect(result).toBe(true)
      done()
    })
  })
})
