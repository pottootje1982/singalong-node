const router = require('./router')()
import { Track, createTrack } from '../scripts/track'
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

router.post('/', async (req, res) => {
  const { artist, title, id } = req.body.track
  const track = createTrack(artist, title, id)
  lyricsDb.updateOrInsert(track, req.body.lyrics)
  res.status(200)
})

router.delete('/', async (req, res) => {
  const { artist, title } = req.query.track
  lyricsDb.remove(new Track(artist, title))
  res.status(204)
})

router.get('/sites', async (req, res) => {
  res.json({ sites: lyricsDownloader.engines })
})

router.post('/download', async (req, res) => {
  const {
    track: { artist, title },
    site,
  } = req.body
  var lyrics = await lyricsDownloader.engines[site].searchLyrics(artist, title)
  res.json({ lyrics })
})

export default router.express()
