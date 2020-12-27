describe('integration:aws:lambda:resource-parser', () => {
  describe('parse', () => {
    it('will return null when the resource is not passed in', async () => {
      const subject = require('./resource-parser')
      const actual = subject.parse()
      expect(actual).toBeNull()
    })
    it('will return null when the resource cannot be parsed', async () => {
      const subject = require('./resource-parser')
      const actual = subject.parse({ resource: 'dsfsdfsdfsfsfsdf' })
      expect(actual).toBeNull()
    })
    it('will return the resource name', async () => {
      const subject = require('./resource-parser')
      const actual = subject.parse({
        resource: 'arn:aws:events:eu-west-1:123456789:rule/rule-name',
      })
      expect(actual).toEqual('rule-name')
    })
  })
})
