const chain = (tasks) => ({
  schedule(schedule) {
    return this.rate().unit(schedule.unit).value(schedule.value)
  },
  rate() {
    return chain(tasks.filter((task) => task.schedule.type === 'rate'))
  },
  unit(unit) {
    return chain(tasks.filter((task) => task.schedule.unit === unit))
  },
  value(value) {
    return chain(tasks.filter((task) => task.schedule.value === value))
  },
  select() {
    return tasks
  },
})
module.exports = (tasks) => chain(tasks) // enable chaining, i.e. filter(tasks).rate().unit('minute').value(1).select()
