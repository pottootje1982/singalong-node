const router = require('./router')()
import { Track } from '../client/src/track'

router.get('/', async (req, res) => {
  const { lyrics } = await res.locals.createDb()
  var { artist, title, id } = req.query
  var selectedTrack = new Track({ artist, title, id })
  let track = await lyrics.queryTrack(selectedTrack)
  res.json({ lyrics: track.lyrics })
})

router.post('/', async (req, res) => {
  const { lyrics } = await res.locals.createDb()
  const track = Track.copy(req.body.track)
  await lyrics.updateOrInsert(track, req.body.lyrics)
  res.status(200)
})

router.delete('/', async (req, res) => {
  const { lyrics } = await res.locals.createDb()
  const track = req.body.track
  lyrics.remove(Track.copy(track))
  res.status(204)
})

router.get('/sites', async (req, res) => {
  const { lyricsDownloader } = await res.locals.createDb()
  res.json({ sites: Object.values(lyricsDownloader.engines) })
})

router.post('/download', async (req, res) => {
  const { lyricsDownloader } = await res.locals.createDb()
  const { track, sleepTime, getCached, sites, save } = req.body
  let lyrics
  const trackToDownload = Track.copy(track)
  const downloadedTrack = await lyricsDownloader.downloadTrack(
    trackToDownload,
    sites,
    parseInt(sleepTime || 0),
    getCached,
    save,
  )
  lyrics = downloadedTrack.lyrics
  res.json({ lyrics })
})

export default router.express()
