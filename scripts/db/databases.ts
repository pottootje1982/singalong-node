import LyricsTable from './table/lyrics'
import CustomPlaylistTable from './table/custom-playlists'
import PlaylistTable from './table/playlists'
import LyricsDownloader from '../download'
import createMongoClient from './mongo-client'

export default async function createDb() {
  const client = await createMongoClient()
  const db = client.db()
  const lyrics = new LyricsTable(db)
  const lyricsDownloader = new LyricsDownloader(lyrics)
  const customPlaylists = new CustomPlaylistTable(db)
  const playlists = new PlaylistTable(db)

  return { lyrics, lyricsDownloader, customPlaylists, playlists, client }
}
