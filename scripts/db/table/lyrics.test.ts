import createDb from '../mongo-client'
import LyricsTable from './lyrics'

const { lyrics } = require('../data/db.test.json')
describe('get', () => {
  let client
  let table

  beforeEach(async () => {
    client = await createDb(global.__MONGO_URI__)
    table = new LyricsTable(client)
    await table.deleteAll()
    for (const lyric of lyrics) {
      await table.insertOne(lyric)
    }
  })

  afterEach(async () => {
    await table.close()
  })

  it('gets all lyrics', async () => {
    let results = await table.find()
    expect(results.length).toEqual(4)

    results = await table.find({ Artist: 'Zager & Evans' })
    expect(results.length).toEqual(1)

    expect(results[0].Artist).toEqual('Zager & Evans')
    expect(results[0].Title).toEqual('In the Year 2525 (Exordium & Terminus)')
  })

  it('finds lyrics', async () => {
    let results = await table.find({ Artist: 'Zager & Evans' })
    expect(results.length).toEqual(1)
    expect(results[0].Artist).toEqual('Zager & Evans')
    expect(results[0].Title).toEqual('In the Year 2525 (Exordium & Terminus)')
  })

  it('removes lyrics', async () => {
    await table.deleteOne({ Artist: 'Zager & Evans' })
    expect((await table.find()).length).toEqual(3)
  })
})
