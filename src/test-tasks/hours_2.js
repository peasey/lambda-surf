const task = () => ({
  name: 'Every 2 hours',
  url: 'http://localhost/task/hourly/1',
  emoji: ':two:',
  schedule: 'rate(2 hours)',
  shouldNotify: () => true,
  run: async function run() {
    return `${this.name} just ran`
  },
})

module.exports = (container, context) => {
  container.push(task(context))
}
