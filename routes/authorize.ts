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
    fs.writeFileSync('./token.txt', tokens.body.access_token)
  }
  res.json(tokens)
})

if (!process.env.NODE_ENV) {
  router.get('/cached_token', async (_req, res) => {
    const accessToken = fs.readFileSync('./token.txt', {
      encoding: 'utf8',
      flag: 'r',
    })
    res.json({ accessToken })
  })
}

router.get('/me', async (req, res) => {
  const spotifyApi = res.locals.getSpotifyApi()
  const me = await spotifyApi.api.getMe()
  res.json(me)
})

export default router.express()
