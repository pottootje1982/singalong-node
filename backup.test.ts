import { Track } from './client/src/track'
import { lyrics } from './scripts/db/databases'

xdescribe('database queries', () => {
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
    const { lyricsDb } = await lyrics()
    const tracks = (
      await lyricsDb.lyricsTable.find({ id: { $regex: /^"/ } })
    ).map(Track.copy)
    for (const track of tracks) {
      //await lyricsDb.remove(track)
      console.log(track.toString())
    }
    await lyricsDb.close()
  })

  it('deletes track', async () => {
    const { lyricsDb } = await lyrics()
    await lyricsDb.lyricsTable.deleteOne({
      id: '3zBhihYUHBmGd2bcQIobrF',
      artist: 'Otis Redding',
      title: '',
      site: 'Genius',
    })
    await lyricsDb.close()
  })
})
