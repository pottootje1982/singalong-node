const router = require('./router')()
import { Track } from '../scripts/track'
import LyricsDownloader from '../scripts/download'
import LyricsDb from '../scripts/lyrics_db'
const createTable = require('../scripts/db/tables')

let lyricsDb: LyricsDb
let lyricsDownloader: LyricsDownloader

createTable('./mongo-client', 'lyrics').then(({ lyricTable }) => {
  lyricsDb = new LyricsDb(lyricTable)
  lyricsDownloader = new LyricsDownloader(lyricsDb)
})

router.get('/', async (req, res) => {
  var artist = req.query.artist
  var title = req.query.title
  var selectedTrack = new Track(artist, title)
  selectedTrack.id = req.query.id
  let track = await lyricsDb.queryTrack(selectedTrack)
  res.json({ lyrics: track.lyrics })
})

export default router.express()
