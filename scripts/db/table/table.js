module.exports = class Table {
  constructor(db, tableName) {
    this.db = db
    this.tableName = tableName
  }

  table() {
    return this.db.get(this.tableName)
  }

  get(query) {
    return query ? this.table().find(query).value() : this.table().value()
  }

  remove(query) {
    return this.table().remove(query).write()
  }

  store(item) {
    return this.table().push(item).write()
  }

  update(query, item) {
    return this.table().find(query).assign(item).write()
  }

  close() {
    this.db.close()
  }
}
