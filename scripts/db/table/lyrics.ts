import Table from './table'
import { MongoClient } from 'mongodb'

export default class LyricsTable extends Table {
  constructor(client: MongoClient) {
    super(client, 'lyrics')
    this.client = client
  }
}
