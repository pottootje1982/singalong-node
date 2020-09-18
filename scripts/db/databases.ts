const LyricsTable = require('./table/lyrics')
const PlaylistsTable = require('./table/playlists')
import LyricsDownloader from '../download'
import LyricsDb from '../lyrics_db'
import PlaylistsDb from '../playlists-db'

module.exports = { lyrics, playlists }

const defaultConnector = './mongo-client'

function createDb(connector) {
  return require(connector || defaultConnector)()
}

async function lyrics(connector, tableName) {
  const db = await createDb(connector)
  const lyricTable = new LyricsTable(db, tableName)
  const lyricsDb = new LyricsDb(lyricTable)
  const lyricsDownloader = new LyricsDownloader(lyricsDb)
  return { lyricsDb, lyricsDownloader }
}

async function playlists(connector) {
  const db = await createDb(connector)
  const playlistsTable = new PlaylistsTable(db)
  const playlistsDb = new PlaylistsDb(playlistsTable)
  return { playlistsDb }
}
