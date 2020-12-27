describe('integration:aws:cloudwatch:schedule-parser', () => {
  describe('parse', () => {
    it('will return null when the schedule is not passed in', async () => {
      const subject = require('./schedule-parser')
      const actual = subject.parse()
      expect(actual).toBeNull()
    })
    it('will return null when the schedule cannot be parsed', async () => {
      const subject = require('./schedule-parser')
      const actual = subject.parse({ schedule: 'dsfsdfsdfsfsfsdf' })
      expect(actual).toBeNull()
    })
    it('will return null when the schedule is not supported', async () => {
      const subject = require('./schedule-parser')
      const actual = subject.parse({ schedule: 'invalid(5 milliseconds)' })
      expect(actual).toBeNull()
    })
    it('will return a rate schedule with unit and value', async () => {
      const subject = require('./schedule-parser')
      const actual = subject.parse({ schedule: 'rate(5 minutes)' })
      expect(actual.type).toEqual('rate')
      expect(actual.unit).toEqual('minutes')
      expect(actual.value).toEqual(5)
    })
  })
})
