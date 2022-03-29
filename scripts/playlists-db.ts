import { Track } from '../client/src/track'
import PlaylistTable from './db/table/playlists'

export default class PlaylistsDb {
  playlistsTable: PlaylistTable

  constructor(playlistsTable) {
    this.playlistsTable = playlistsTable
  }

  get(): Promise<any> {
    return this.playlistsTable.find()
  }

  async hydrate(playlists): Promise<any> {
    const meta = await this.playlistsTable.find()
    return playlists.map(p => {
      const found = meta.find(m => m.uri === p.uri) || {}
      return { ...p, ...found }
    })
  }

  async update(uri: string, playlist): Promise<any> {
    await this.playlistsTable.findOneAndUpdate({ uri }, playlist, true)
    return playlist
  }

  close() {
    this.playlistsTable.close()
  }
}
