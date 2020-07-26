const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  return spotifyApi.api.getUserPlaylists(null, { limit: 50 }).then((data) => {
    var playlists = data ? data.body.items : []
    res.json(playlists)
  })
})

export default router.express()
