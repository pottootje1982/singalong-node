import express = require('express')
const router = express.Router()

import { SpotifyApi } from '../scripts/spotify'

router.get('/', async (req: express.Request, res: express.Response) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  var data = await spotifyApi.api.getUserPlaylists(null, { limit: 50 })
  var playlists = data ? data.body.items : []
  res.json(playlists)
})

export default router
