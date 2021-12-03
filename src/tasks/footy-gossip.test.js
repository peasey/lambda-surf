const rumours = [
  `This rumour has the keyword test in it`,
  `This rumour does not have the keyword in it`,
  `This rumour has an alternative keyword check in it`,
  `This rumour does not have any keywords in it`,
  `This rumour has an uppercased keyword CHECK in it`,
]

const mockJsonItem = (data) => ({
  jsonValue: () => data,
})

const mockHtmlElement = (jsonItem) => ({
  getProperty: async () =>
    new Promise((resolve) => {
      resolve(jsonItem)
    }),
})

const mockPage = (htmlElements) => ({
  goto: async () => Promise.resolve(),
  $$: async () => Promise.resolve(htmlElements),
  close: async () => Promise.resolve(),
})

const browserFactory = (page) => async () =>
  Promise.resolve({
    newPage: async () => Promise.resolve(page),
    close: async () => Promise.resolve(),
  })

const rumourElements = rumours
  .map((rumour) => mockJsonItem(rumour))
  .map((jsonItem) => mockHtmlElement(jsonItem))

describe('tasks:footy-gossip', () => {
  it('will return the default resposne when there are no rumours to match', async () => {
    const context = {
      browserFactory: browserFactory(mockPage()),
      rumourMatcher: /(test|check)/,
    }
    const container = []
    require('./footy-gossip')(container, context)
    const subject = container[0]
    const actual = await subject.run()
    expect(actual).toMatch(/No gossip today/)
  })

  it('will match and filter the rumours when they exist', async () => {
    const context = {
      browserFactory: browserFactory(mockPage(rumourElements)),
      rumourMatcher: /(test|check)/,
    }
    const container = []
    require('./footy-gossip')(container, context)
    const subject = container[0]
    const actual = await subject.run()
    expect(actual).toMatch(rumours[0])
    expect(actual).toMatch(rumours[2])
  })

  it('will match case-insensitive and filter the rumours when they exist', async () => {
    const context = {
      browserFactory: browserFactory(mockPage(rumourElements)),
      rumourMatcher: /(test|check)/i,
    }
    const container = []
    require('./footy-gossip')(container, context)
    const subject = container[0]
    const actual = await subject.run()
    expect(actual).toMatch(rumours[0])
    expect(actual).toMatch(rumours[4])
  })
})
