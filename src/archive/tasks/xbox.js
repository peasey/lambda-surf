const log = require('../../integration/logging')('task:xbox-series-x')

const name = 'Xbox Series X Stock'
const url = 'https://www.xbox.com/en-GB/consoles/xbox-series-x#purchase'
const emoji = ':joystick:'
const schedule = 'rate(1 hour)'
const shouldNotify = (result) => result == null || result.match(/^No stock/) == null

async function run(context) {
  let result
  const browser = await context.browserFactory()

  try {
    log.info(`loading ${url}...`)

    const page = await browser.newPage()

    await page.goto(url)
    const retailerElements = (await page.$$('div.hatchretailer')) || []

    log.info(`found ${retailerElements.length} retailers...`)

    const retailerName = async (retailer) =>
      retailer.$eval(
        `span.retlogo img`,
        (element) => element.getAttribute('alt').slice(0, -' logo'.length), // trim ' logo' off the end of the alt text to get the retailer name
      )

    const retailerStock = async (retailer) =>
      retailer.$eval(`span.retstockbuy span`, (element) => element.innerHTML)

    const hasStock = (retailers) =>
      retailers.reduce((acc, curr) => {
        if (curr.stock.toUpperCase() !== 'OUT OF STOCK') {
          acc.push(curr)
        }

        return acc
      }, [])

    const retailers = await Promise.all(
      [...retailerElements].map(async (retailer) => ({
        name: await retailerName(retailer),
        stock: await retailerStock(retailer),
      })),
    )

    const retailersWithStock = hasStock(retailers)

    result =
      retailersWithStock.length > 0
        ? retailersWithStock.map((retailer) => `${retailer.name} (${retailer.stock})`).join(`\n\n`)
        : 'No stock.'

    log.info(`result is ${result}`)

    log.info('closing page')
    await page.close()
    log.info('closed page')
  } catch (err) {
    log.error('unexpected error while looking for xbox retailers with stock', err)
  } finally {
    if (browser) {
      try {
        log.info('closing browser')
        await browser.close()
      } catch (err) {
        log.error('error while trying to close the browser', err)
      }
    }
  }

  return result
}

const task = (
  context = {
    browserFactory: require('../../integration/aws/lambda/browser'),
  },
) => ({
  name,
  url,
  emoji,
  schedule,
  shouldNotify,
  run: async () => run(context),
})

module.exports = (container, context) => {
  container.push(task(context))
}
