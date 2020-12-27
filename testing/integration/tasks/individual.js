const container = []

// eslint-disable-next-line import/no-dynamic-require
require(process.argv[2])(container)

const task = container[0]
task.run()
