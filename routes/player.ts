const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const currentlyPlaying = await spotifyApi.getCurrentlyPlayingTrack()
  res.json(currentlyPlaying)
})

router.post('/', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const { command } = req.body
  if (command === 'previous') spotifyApi.api.skipToPrevious()
  else if (command === 'next') spotifyApi.api.skipToNext()
  res.status(200)
})

const track = (id) => id && `spotify:track:${id}`

router.put('/play', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const { body } = req
  body.uris = body.ids && body.ids.filter((id) => id).map((id) => track(id))
  body.offset.uri = body.offset.id && track(body.offset.id)
  await spotifyApi.api.play(body)
  res.sendStatus(200)
})

export default router.express()
