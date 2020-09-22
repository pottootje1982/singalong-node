import { MongoClient } from 'mongodb'

let client

export default async function createDb() {
  if (client) {
    return client
  } else {
    client = await MongoClient.connect(global.__MONGO_URI__, {
      useUnifiedTopology: true,
    })
    return client
  }
}
