const retailers = [
  {
    alt: 'retailer1.co.uk logo',
    stock: 'OUT OF STOCK',
  },
  {
    alt: 'retailer2.co.uk logo',
    stock: 'IN STOCK',
  },
  {
    alt: 'retailer3.co.uk logo',
    stock: 'OUT OF STOCK',
  },
  {
    alt: 'retailer4.co.uk logo',
    stock: 'STOCK!',
  },
]

const mockHtmlElement = (retailer) => ({
  $eval: async (selector, elementVisitor) => {
    let data = {
      innerHTML: retailer.stock,
    }

    if (selector === 'span.retlogo img') {
      data = {
        getAttribute: () => retailer.alt,
      }
    }

    return Promise.resolve(elementVisitor(data))
  },
})

const retailerElements = retailers.map((retailer) => mockHtmlElement(retailer))

const mockPage = (elements) => ({
  goto: async () => Promise.resolve(),
  $$: async () => Promise.resolve(elements),
  close: async () => Promise.resolve(),
})

const browserFactory = (page) => async () =>
  Promise.resolve({
    newPage: async () => Promise.resolve(page),
    close: async () => Promise.resolve(),
  })

describe('tasks:xbox', () => {
  it('will return the default resposne when there are no retailers to match and will not notify', async () => {
    const context = {
      browserFactory: browserFactory(mockPage()),
    }
    const container = []
    require('./xbox')(container, context)
    const subject = container[0]
    const actual = await subject.run()
    const notify = subject.shouldNotify(actual)
    expect(actual).toMatch(/No stock/)
    expect(notify).toBe(false)
  })

  it('will match and filter the retailers with stock when they exist and notify', async () => {
    const context = {
      browserFactory: browserFactory(mockPage(retailerElements)),
    }
    const container = []
    require('./xbox')(container, context)
    const subject = container[0]
    const actual = await subject.run()
    const notify = subject.shouldNotify(actual)
    expect(actual).toMatch(/(retailer2.co.uk)*(IN STOCK)*(retailer4.co.uk)*(STOCK!)/)
    expect(notify).toBe(true)
  })
})
