const router = require('./router')()
const { get } = require('axios')
import { Track } from '../client/src/track'
const db = require('../scripts/db/databases')

router.get('/fip', async (req, res) => {
  const { lyricsDb } = await db.lyrics()
  const { data } = await get('https://api.radiofrance.fr/livemeta/pull/7')
  const { steps, levels } = data
  const { items, position } = levels[levels.length - 1]
  let tracks = items
    .map((id) => steps[id])
    .map(({ songId: id, authors: artist, title }) =>
      Track.copy({ id, artist, title })
    )
  tracks = await lyricsDb.queryPlaylist(tracks)
  await lyricsDb.close()
  res.json({ tracks, position })
})

export default router.express()
