const Table = require("./table")

class LyricsTable extends Table {
  constructor(db) {
    super(db, "lyrics")
    this.db = db
    this.db.defaults({ orders: [] }).write()
  }
}

module.exports = LyricsTable
