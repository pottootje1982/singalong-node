const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'
const fs = require('fs')

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = new SpotifyApi(req.headers.origin)
  res.json(spotifyApi.getAuthorizeUrl())
})

router.get('/token', async (req, res) => {
  var spotifyApi: SpotifyApi = new SpotifyApi(req.headers.origin)
  const tokens = await spotifyApi.getToken(req.query.code)
  if (!process.env.NODE_ENV) {
    await fs.writeFileSync('./token.txt', tokens.body.access_token)
  }
  res.json(tokens)
})

router.get('/me', async (req, res) => {
  const spotifyApi = res.locals.getSpotifyApi()
  const me = await spotifyApi.api.getMe()
  res.json(me)
})

export default router.express()
