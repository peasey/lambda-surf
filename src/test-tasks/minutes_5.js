const task = () => ({
  name: 'Every 5 mins',
  url: 'http://localhost/task/minutes/5',
  emoji: ':five:',
  schedule: 'rate(5 minutes)',
  shouldNotify: () => true,
  run: async function run() {
    return `${this.name} just ran`
  },
})

module.exports = (container, context) => {
  container.push(task(context))
}
