const Table = require('./table')

class PlaylistsTable extends Table {
  constructor(db, tableName) {
    super(db, tableName || 'customPlaylists')
    this.db = db
    this.db.defaults({ customPlaylists: [] }).write()
  }
}

module.exports = PlaylistsTable
