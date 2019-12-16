const Memory = require("lowdb/adapters/Memory")
const FileDbWrapper = require("./file-db-wrapper")
const low = require("lowdb")
const path = require("path")

module.exports = function(file) {
  const adapter = new Memory()
  const db = low(adapter)
  if (file) {
    file = path.resolve(__dirname, file)
    const contents = require(file)
    db.defaults(contents).write()
  }
  return new FileDbWrapper(db)
}
