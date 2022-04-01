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
  res.json({ sites: lyricsDownloader.engines })
})

router.post('/download', async (req, res) => {
  const { lyricsDownloader } = await res.locals.createDb()
  const { track, sleepTime, getCached, site, save } = req.body
  let lyrics
  const trackToDownload = Track.copy(track)
  if (site) {
    const artist = trackToDownload.cleanArtist()
    const title = trackToDownload.cleanTitle()
    lyrics = await lyricsDownloader.engines[site].searchLyrics(artist, title)
  } else {
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
