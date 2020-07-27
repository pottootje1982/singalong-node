const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = new SpotifyApi(req.headers.origin)
  res.json(spotifyApi.getAuthorizeUrl())
})

router.get('/token', async (req, res) => {
  var spotifyApi: SpotifyApi = new SpotifyApi(req.headers.origin)
  const tokens = await spotifyApi.getToken(req.query.code)
  res.json(tokens)
})

router.get('/me', async (req, res) => {
  const spotifyApi = res.locals.getSpotifyApi()
  res.json(await spotifyApi.api.getMe())
})

export default router.express()
