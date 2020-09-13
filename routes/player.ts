const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const currentlyPlaying = await spotifyApi.getCurrentlyPlayingTrack()
  res.json(currentlyPlaying)
})

router.post('/', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const { command, position } = req.body
  if (command === 'previous') spotifyApi.api.skipToPrevious()
  else if (command === 'next') spotifyApi.api.skipToNext()
  else if (command === 'position') spotifyApi.api.seek(position)
  else if (command === 'pause') spotifyApi.api.pause()
  res.status(200)
})

router.put('/play', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  let {
    deviceId,
    uris,
    context_uri,
    offset: { position, uri },
  } = req.body
  uris = uris && uris.filter((id) => id)
  if (deviceId) await spotifyApi.transferPlayback(deviceId)
  await spotifyApi.api.play({ uris, context_uri, offset: { position, uri } })
  res.sendStatus(200)
})

router.get('/devices', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const devices = await spotifyApi.devices()
  res.json(devices)
})

router.put('/', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const devices = await spotifyApi.transferPlayback(req.body.ids)
  res.json(devices)
})

export default router.express()
