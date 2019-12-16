const db = require("./mongo-client")

class MongoWrapper {
  constructor(client) {
    this.client = client
    this.db = client.db()
  }

  close() {
    this.client.close()
  }

  get(table) {
    return new MongoTableWrapper(this.db.collection(table))
  }

  defaults() {
    return this
  }

  write() {
    // Stub for defaults to do nothing
  }

  async find(query) {
    return db.findOne(query)
  }
}

class MongoTableWrapper {
  constructor(table) {
    this.table = table
  }

  find(query) {
    this.query = query
    return this
  }

  cloneDeep() {
    return this
  }

  assign(value) {
    this.valueToUpdate = value
    return this
  }

  push(value) {
    this.valueToAdd = value
    return this
  }

  upsert(value) {
    this.upsert = true
    this.valueToUpdate = value
    return this
  }

  remove(query) {
    this.queryToDelete = query
    return this
  }

  unset(key) {
    delete this.valueToUpdate[key]
    return this
  }

  async value() {
    if (this.query) return await this.table.findOne(this.query)
    return await this.table.find().toArray()
  }

  async write() {
    if (this.valueToAdd) {
      await this.table.insertOne(this.valueToAdd)
    } else if (this.query && this.valueToUpdate) {
      await this.table.findOneAndReplace(this.query, this.valueToUpdate, {
        upsert: this.upsert
      })
    } else if (this.queryToDelete) {
      await this.table.deleteOne(this.queryToDelete)
    }
  }
}

module.exports = MongoWrapper
