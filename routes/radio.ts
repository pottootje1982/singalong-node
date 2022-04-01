const router = require('./router')()
const { get } = require('axios')
import { Track } from '../client/src/track'
const db = require('../scripts/db/databases')

router.get('/fip', async (_req, res) => {
  const { lyrics } = await res.locals.createDb()
  const { data } = await get('https://api.radiofrance.fr/livemeta/pull/7')
  const { steps, levels } = data
  const { items, position } = levels[levels.length - 1]
  let tracks = items
    .map((id) => steps[id])
    .map(({ songId: id, authors: artist, title }) =>
      Track.copy({ id, artist, title })
    )
  tracks = await lyrics.queryPlaylist(tracks)
  res.json({ tracks, position })
})

export default router.express()
