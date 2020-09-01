const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const currentlyPlaying = await spotifyApi.getCurrentlyPlayingTrack()
  res.json(currentlyPlaying)
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
