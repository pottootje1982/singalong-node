const Table = require("./table")

class LyricsTable extends Table {
  constructor(db, tableName) {
    super(db, tableName || "lyrics")
    this.db = db
    this.db.defaults({ lyrics: [] }).write()
  }
}

module.exports = LyricsTable
