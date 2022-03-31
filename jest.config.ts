import { assert } from "console"

require('dotenv').config()

assert(process.env.DB_TEST_CONNECTION_STRING, "Please define DB_TEST_CONNECTION_STRING")
process.env.DB_CONNECTION_STRING = process.env.DB_TEST_CONNECTION_STRING

module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['<rootDir>/.jest/jest-mongodb-config.js'],
  setupFilesAfterEnv: ['<rootDir>/.jest/create-test-db.js'],
  maxWorkers: 1,
  testRegex: '.test.ts$',
}
