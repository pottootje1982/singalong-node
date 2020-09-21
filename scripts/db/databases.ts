import LyricsTable from './table/lyrics'
import PlaylistsTable from './table/playlists'
import LyricsDownloader from '../download'
import LyricsDb from '../lyrics_db'
import PlaylistsDb from '../playlists-db'
import createDb from './mongo-client'

export async function lyrics() {
  const client = await createDb()
  const lyricTable = new LyricsTable(client)
  const lyricsDb = new LyricsDb(lyricTable)
  const lyricsDownloader = new LyricsDownloader(lyricsDb)
  return { lyricsDb, lyricsDownloader }
}

export async function playlists() {
  const client = await createDb()
  const playlistsTable = new PlaylistsTable(client)
  const playlistsDb = new PlaylistsDb(playlistsTable)
  return { playlistsDb }
}
