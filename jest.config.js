module.exports = {
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
    '!src/integration/aws/lambda/browser.js',
    '!src/integration/plugins/index.js',
    '!src/tasks/*',
    '!src/test-tasks/*',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
