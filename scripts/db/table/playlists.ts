import Table from './table'
import { MongoClient } from 'mongodb'

export default class PlaylistTable extends Table {
  constructor(client: MongoClient, tableName?: string) {
    super(client, tableName || 'playlists')
  }
}
