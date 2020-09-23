import { Track, simpleTrack } from './client/src/track'
import { lyrics } from './scripts/db/databases'

xdescribe('database queries', () => {
  let lyricsDb
  beforeAll(async () => {
    ;({ lyricsDb } = await lyrics())
  })

  afterAll(async () => {
    await lyricsDb.close()
  })

  it('find duplicates', () => {
    const tracks = require('./backup.json').map((t) => Track.copy(t))
    for (const track of tracks) {
      const duplicates = tracks.filter(
        (t) => t.id === track.id && t.id !== '' && t.id !== 'NULL' && t.id
      )
      if (duplicates.length > 1) {
        console.log(duplicates) //duplicates.map((t) => t.toString()))
      }
    }
  })

  it('finds wrong ids', async () => {
    const tracks = (
      await lyricsDb.lyricsTable.find({ id: { $regex: /^"/ } })
    ).map(Track.copy)
    for (const track of tracks) {
      //await lyricsDb.remove(track)
      console.log(track.toString())
    }
  })

  it('removes dire straits - news', async () => {
    let track = await lyricsDb.queryTrack(simpleTrack('Dire Straits', 'News'))
    await lyricsDb.remove(track)
    track = await lyricsDb.queryTrack(simpleTrack('Dire Straits', 'News'))
    console.log(track)
  })

  it('deletes track', async () => {
    await lyricsDb.lyricsTable.deleteOne({
      id: '3zBhihYUHBmGd2bcQIobrF',
      artist: 'Otis Redding',
      title: '',
      site: 'Genius',
    })
  })
})
