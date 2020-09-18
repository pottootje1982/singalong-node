const router = require('./router')()
import { Track } from '../client/src/track'
const db = require('../scripts/db/databases')

router.get('/', async (req, res) => {
  const { lyricsDb } = await db.lyrics()
  var { artist, title, id } = req.query
  var selectedTrack = new Track({ artist, title, id })
  let track = await lyricsDb.queryTrack(selectedTrack)
  lyricsDb.close()
  res.json({ lyrics: track.lyrics })
})

router.post('/', async (req, res) => {
  const { lyricsDb } = await db.lyrics()
  const track = Track.copy(req.body.track)
  lyricsDb.updateOrInsert(track, req.body.lyrics)
  lyricsDb.close()
  res.status(200)
})

router.delete('/', async (req, res) => {
  const { lyricsDb } = await db.lyrics()
  const track = req.body.track
  lyricsDb.remove(Track.copy(track))
  lyricsDb.close()
  res.status(204)
})

router.get('/sites', async (req, res) => {
  const { lyricsDownloader } = await db.lyrics()
  res.json({ sites: lyricsDownloader.engines })
  lyricsDownloader.close()
})

router.post('/download', async (req, res) => {
  const { lyricsDownloader } = await db.lyrics()
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
  lyricsDownloader.close()
  res.json({ lyrics })
})

export default router.express()
