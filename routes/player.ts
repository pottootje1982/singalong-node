const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  return spotifyApi.api.getUserPlaylists(null, { limit: 50 }).then((data) => {
    var playlists = data ? data.body.items : []
    res.json(playlists)
  })
})

router.get('/:id', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  const { user, playlist } = req.query
  spotifyApi.api.play({
    context_uri: 'spotify:user:' + user + ':playlist:' + playlist,
    offset: { uri: 'spotify:track:' + req.params.id },
  })
  res.sendStatus(200)
})

export default router.express()
