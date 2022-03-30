process.env.PUBLIC_KEY = 'TEST'
process.env.INIT_VECTOR = 'TEST'

module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['<rootDir>/.jest/jest-mongodb-config.js'],
  setupFilesAfterEnv: ['<rootDir>/.jest/create-test-db.js'],
  maxWorkers: 1,
  testRegex: '.test.ts$',
}
