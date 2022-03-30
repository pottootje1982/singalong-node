import Table from './table'
import { Db } from 'mongodb'
import { Track } from '../../../client/src/track'
const uuid = require('uuid')

export default class CustomPlaylistTable extends Table {
  constructor(db: Db, tableName?: string) {
    super(db, tableName || 'customPlaylists')
  }

  async get(owner: string, id?: string): Promise<any> {
    const playlists = await (id
      ? this.find({ id, owner })
      : this.find({ owner }))
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
    await this.table().insertOne(playlist)
    return playlist
  }

  async update(id: string, tracksString: string, name: string): Promise<any> {
    const playlist = this.parse(id, tracksString, name)
    await this.findOneAndUpdate({ id }, playlist)
    return playlist
  }

  remove(id: string): Promise<any> {
    return this.table().deleteOne({ id })
  }
}
