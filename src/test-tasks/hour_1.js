const task = () => ({
  name: 'Every hour',
  url: 'http://localhost/task/hourly/1',
  emoji: ':one:',
  schedule: 'rate(1 hour)',
  shouldNotify: () => true,
  run: async function run() {
    return `${this.name} just ran`
  },
})

module.exports = (container, context) => {
  container.push(task(context))
}
