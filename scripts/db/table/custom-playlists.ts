import Table from './table'
import { MongoClient } from 'mongodb'

export default class CustomPlaylistTable extends Table {
  constructor(client: MongoClient, tableName?: string) {
    super(client, tableName || 'customPlaylists')
  }
}
