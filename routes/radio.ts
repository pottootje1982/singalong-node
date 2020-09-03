const router = require('./router')()
const { get } = require('axios')
import LyricsDb from '../scripts/lyrics_db'
const createTable = require('../scripts/db/tables')
import { Track } from '../scripts/track'

let lyricsDb: LyricsDb

createTable('./mongo-client', 'lyrics').then(({ lyricTable }) => {
  lyricsDb = new LyricsDb(lyricTable)
})

router.get('/fip', async (req, res) => {
  const { data } = await get('https://api.radiofrance.fr/livemeta/pull/7')
  const { steps, levels } = data
  const { items, position } = levels[0]
  let tracks = items
    .map((id) => steps[id])
    .map(({ uuid: id, authors: artist, title }) =>
      Track.copy({ id, artist, title })
    )
  tracks = await lyricsDb.queryPlaylist(tracks)
  res.json({ tracks, position })
})

export default router.express()
