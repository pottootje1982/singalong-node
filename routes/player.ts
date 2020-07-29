const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'
import { Track } from '../scripts/track'

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  var currentTrack = await spotifyApi.api.getMyCurrentPlayingTrack()
  let track: any = Track.fromSpotify(
    currentTrack && currentTrack.body ? currentTrack.body.item : null
  )
  if (track) {
    track.progress_ms = currentTrack.body.progress_ms
    track.is_playing = currentTrack.body.is_playing
  }
  res.json(track)
})

const track = (id) => id && `spotify:track:${id}`

router.put('/play', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const { body } = req
  body.uris = body.ids && body.ids.map((id) => track(id))
  body.offset.uri = body.offset.id && track(body.offset.id)
  await spotifyApi.api.play(body)
  res.sendStatus(200)
})

export default router.express()
