const log = require('../integration/logging')('task:footy-gossip')

const name = 'Footy gossip'
const url = 'https://www.bbc.co.uk/sport/football/gossip'
const emoji = ':soccer:'
const schedule = 'rate(1 day)'
const shouldNotify = () => true

async function run(context) {
  let result
  const browser = await context.browserFactory()

  try {
    log.info(`loading ${url}...`)

    const page = await browser.newPage()

    await page.goto(url)
    const allRumours = (await page.$$('article div p')) || []

    log.info(`found ${allRumours.length} total rumours...`)

    const text = await Promise.all(
      [...allRumours].map((rumour) =>
        rumour.getProperty('innerText').then((item) => item.jsonValue()),
      ),
    )

    const matchedRumours = text.filter((rumour) => rumour.match(context.rumourMatcher))

    log.info(`found ${matchedRumours.length} matching rumours...`)

    result = matchedRumours.length > 0 ? matchedRumours.join(`\n\n`) : 'No gossip today.'

    log.info('closing page')
    await page.close()
    log.info('closed page')
  } catch (err) {
    log.error('unexpected error while browsing for footy gossip', err)
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
    browserFactory: require('../integration/aws/lambda/browser'),
    rumourMatcher: /(Newcastle|Toon)/,
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
