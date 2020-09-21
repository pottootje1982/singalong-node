const { dbConnectionString } = require('../../config')

import { MongoClient } from 'mongodb'

export default async function createDb(connectionString?: string) {
  const client = await MongoClient.connect(
    connectionString || dbConnectionString,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  ).catch((err) => {
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
