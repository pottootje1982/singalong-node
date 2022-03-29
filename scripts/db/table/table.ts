import { Db, MongoClient } from 'mongodb'

export default class Table {
  db: Db
  tableName: string
  client: MongoClient

  constructor(client: MongoClient, tableName: string) {
    this.client = client
    this.db = client.db()
    this.tableName = tableName
  }

  table() {
    return this.db.collection(this.tableName)
  }

  find(query?: any) {
    return this.table().find(query).toArray()
  }

  deleteOne(query) {
    return this.table().deleteOne(query)
  }

  deleteAll() {
    return this.table().deleteMany(() => true)
  }

  insertOne(item) {
    return this.table().insertOne(item)
  }

  findOneAndUpdate(query, item, upsert = false) {
    return this.table().findOneAndUpdate(
      query,
      { $set: item },
      {
        upsert,
      }
    )
  }

  close() {
    return this.client.close()
  }
}
