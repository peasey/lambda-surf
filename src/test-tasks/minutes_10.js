const task = () => ({
  name: 'Every 10 mins',
  url: 'http://localhost/task/minutes/10',
  emoji: ':keycap_ten:',
  schedule: 'rate(10 minutes)',
  shouldNotify: () => true,
  run: async function run() {
    return `${this.name} just ran`
  },
})

module.exports = (container, context) => {
  container.push(task(context))
}
