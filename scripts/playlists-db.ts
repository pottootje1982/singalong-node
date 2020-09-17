import { Track } from '../client/src/track'
const { v4: uuid } = require('uuid')

export default class PlaylistsDb {
  playlistsTable: any

  constructor(playlistsTable) {
    this.playlistsTable = playlistsTable
  }

  async get(owner: string, id?: string): Promise<any> {
    const playlists = await (id
      ? this.playlistsTable.get({ id, owner })
      : this.playlistsTable.get({ owner }))
    return playlists.map((p) => ({ ...p, tracks: p.tracks.map(Track.copy) }))
  }

  parse(id, tracksString, name): any {
    const lines = tracksString.match(/[^\r\n]+/g)
    const tracks = lines.map((l) => ({ ...Track.parse(l), id: uuid() }))
    return {
      id: id,
      name,
      tracks,
    }
  }

  async insert(
    owner: string,
    tracksString: string,
    name: string
  ): Promise<any> {
    const playlist = this.parse(uuid(), tracksString, name)
    playlist.owner = owner
    await this.playlistsTable.store(playlist)
    return playlist
  }

  async update(id: string, tracksString: string, name: string): Promise<any> {
    const playlist = this.parse(id, tracksString, name)
    await this.playlistsTable.update({ id }, playlist)
    return playlist
  }
}
