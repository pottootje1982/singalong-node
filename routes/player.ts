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

router.put('/play', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  let {
    uris,
    context_uri,
    offset: { position, uri },
  } = req.body
  uris = uris && uris.filter((id) => id)
  await spotifyApi.api.play({ uris, context_uri, offset: { position, uri } })
  res.sendStatus(200)
})

export default router.express()
