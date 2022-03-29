import LyricsTable from './table/lyrics'
import CustomPlaylistTable from './table/custom-playlists'
import PlaylistTable from './table/playlists'
import LyricsDownloader from '../download'
import LyricsDb from '../lyrics_db'
import CustomPlaylistsDb from '../custom-playlists-db'
import PlaylistsDb from '../playlists-db'
import createDb from './mongo-client'

export async function lyrics() {
  const client = await createDb()
  const lyricTable = new LyricsTable(client)
  const lyricsDb = new LyricsDb(lyricTable)
  const lyricsDownloader = new LyricsDownloader(lyricsDb)
  return { lyricsDb, lyricsDownloader }
}

export async function customPlaylists() {
  const client = await createDb()
  const playlistsTable = new CustomPlaylistTable(client)
  return new CustomPlaylistsDb(playlistsTable)
}

export async function playlists() {
  const client = await createDb()
  const playlistsTable = new PlaylistTable(client)
  return new PlaylistsDb(playlistsTable)
}
