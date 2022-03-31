const { dbConnectionString } = require('../../config')

import { MongoClient, MongoClientOptions } from 'mongodb'
const connectionOptions: MongoClientOptions = { maxPoolSize: 5 };

export default async function createDb(): Promise<MongoClient> {
  const client = await MongoClient.connect(dbConnectionString, connectionOptions).catch((err) => {
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
