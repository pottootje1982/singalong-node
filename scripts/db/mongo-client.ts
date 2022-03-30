const { dbConnectionString } = require('../../config')

import { MongoClient } from 'mongodb'

export default async function createDb(): Promise<MongoClient> {
  console.log(dbConnectionString)
  const client = await MongoClient.connect(dbConnectionString).catch((err) => {
    console.log(err)
  })

  if (!client) {
    return
  }

  try {
    return client
  } catch (err) {
    console.log(err)
  }
}
