/* eslint-disable no-console */
const prefix = 'my:prefix'
const message = 'my message'
const error = 'my error'

describe('integration:logger', () => {
  it('debug: logs messages with the specified prefix', async () => {
    console.info = jest.fn()
    const subject = require('.')(prefix)
    subject.debug(message)
    expect(console.info.mock.calls[0][0]).toBe(`[${prefix}] ${message}`)
  })

  it('info: logs messages with the specified prefix', async () => {
    console.info = jest.fn()
    const subject = require('.')(prefix)
    subject.info(message)
    expect(console.info.mock.calls[0][0]).toBe(`[${prefix}] ${message}`)
  })

  it('error: logs messages with the specified prefix', async () => {
    console.error = jest.fn()
    const subject = require('.')(prefix)
    subject.error(message)
    expect(console.error.mock.calls[0][0]).toBe(`[${prefix}] ${message}`)
  })

  it('error: logs messages and error with the specified prefix', async () => {
    console.error = jest.fn()
    const subject = require('.')(prefix)
    subject.error(message, new Error(error))
    expect(console.error.mock.calls[0][0]).toBe(`[${prefix}] ${message}`)
    expect(console.error.mock.calls[0][1].message).toBe(error)
  })
})
