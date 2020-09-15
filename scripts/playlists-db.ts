import { Track } from '../client/src/track'

export default class PlaylistsDb {
  playlistsTable: any

  constructor(playlistsTable) {
    this.playlistsTable = playlistsTable
  }

  async get(id?: string): Promise<any> {
    const playlists = await (id
      ? this.playlistsTable.get({ id })
      : this.playlistsTable.get())
    return playlists.map((p) => ({ ...p, tracks: p.tracks.map(Track.copy) }))
  }

  insert(playlist: any): Promise<any> {
    return this.playlistsTable.store(playlist)
  }
}
