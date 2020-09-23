import { Track } from '../client/src/track'
const { v4: uuid } = require('uuid')
import PlaylistTable from './db/table/playlists'

export default class PlaylistsDb {
  playlistsTable: PlaylistTable

  constructor(playlistsTable) {
    this.playlistsTable = playlistsTable
  }

  async get(owner: string, id?: string): Promise<any> {
    const playlists = await (id
      ? this.playlistsTable.find({ id, owner })
      : this.playlistsTable.find({ owner }))
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
    await this.playlistsTable.insertOne(playlist)
    return playlist
  }

  async update(id: string, tracksString: string, name: string): Promise<any> {
    const playlist = this.parse(id, tracksString, name)
    await this.playlistsTable.findOneAndUpdate({ id }, playlist)
    return playlist
  }

  remove(id: string): Promise<any> {
    return this.playlistsTable.deleteOne({ id })
  }

  close() {
    this.playlistsTable.close()
  }
}
