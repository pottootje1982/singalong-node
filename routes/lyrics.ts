const router = require('./router')()
import { Track } from '../client/src/track'
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
  var { artist, title, id } = req.query
  var selectedTrack = new Track({ artist, title, id })
  let track = await lyricsDb.queryTrack(selectedTrack)
  res.json({ lyrics: track.lyrics })
})

router.post('/', async (req, res) => {
  const track = Track.copy(req.body.track)
  lyricsDb.updateOrInsert(track, req.body.lyrics)
  res.status(200)
})

router.delete('/', async (req, res) => {
  const track = req.body.track
  lyricsDb.remove(Track.copy(track))
  res.status(204)
})

router.get('/sites', async (req, res) => {
  res.json({ sites: lyricsDownloader.engines })
})

router.post('/download', async (req, res) => {
  const { track, sleepTime, getCached, site, save } = req.body
  let lyrics
  if (site) {
    const { artist, title } = track
    lyrics = await lyricsDownloader.engines[site].searchLyrics(artist, title)
  } else {
    const trackToDownload = Track.copy(track)
    const downloadedTrack = await lyricsDownloader.downloadTrack(
      trackToDownload,
      parseInt(sleepTime || 3000),
      getCached,
      save
    )
    lyrics = downloadedTrack.lyrics
  }
  res.json({ lyrics })
})

export default router.express()
