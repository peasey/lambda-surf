describe('integration:aws:cloudwatch:rules', () => {
  describe('byName', () => {
    it('will result in a null return value when not passed a name ', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () => Promise.reject(new Error('does not exist')),
        }),
      }
      const rule = await subject.byName()
      expect(rule).toBeNull()
    })
    it('will result in a null return value when passed a name for a rule that doesnt exist', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () => Promise.reject(new Error('does not exist')),
        }),
      }
      const rule = await subject.byName({ name: 'does/not/exist' })
      expect(rule).toBeNull()
    })
    it('will result in a null return value when an unexpected error occurs', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () => Promise.reject(new Error('something went wrong')),
        }),
      }
      const rule = await subject.byName({ name: 'rule#1' })
      expect(rule).toBeNull()
    })
    it('will result in a null return value when a schedule cannot be parsed', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () =>
            Promise.resolve({
              Name: 'rule#1',
              ScheduleExpression: 'sadasdsadss',
              State: 'DISABLED',
            }),
        }),
      }
      const rule = await subject.byName({ name: 'rule#1' })
      expect(rule).toBeNull()
    })
    it('will return a rule when a rule exists with the specified name', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () =>
            Promise.resolve({
              Name: 'rule#1',
              ScheduleExpression: 'rate(5 minutes)',
              State: 'ENABLED',
            }),
        }),
      }
      const rule = await subject.byName({ name: 'rule#1' })
      expect(rule).not.toBeNull()
      expect(rule.enabled).toBe(true)
      expect(rule.schedule).toEqual({
        type: 'rate',
        unit: 'minutes',
        value: 5,
      })
    })

    it('will return a disabled rule if the rule is not enabled', async () => {
      const subject = require('.')
      subject.client = {
        describeRule: () => ({
          promise: async () =>
            Promise.resolve({
              Name: 'rule#1',
              ScheduleExpression: 'rate(5 minutes)',
              State: 'DISABLED',
            }),
        }),
      }
      const rule = await subject.byName({ name: 'rule#1' })
      expect(rule).not.toBeNull()
      expect(rule.enabled).toBe(false)
    })
  })
})
