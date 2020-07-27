const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  return spotifyApi.api.getUserPlaylists(null, { limit: 50 }).then((data) => {
    var playlists = data ? data.body.items : []
    res.json(playlists)
  })
})

router.get('/:id/users/:userId', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  const playlist = await spotifyApi.api.getPlaylist(
    req.params.userId,
    req.params.id
  )
  res.json(
    playlist.body.tracks.items
      .filter((item) => item.track)
      .map(({ track: { id, name, artists } }) => ({
        id,
        artist: artists[0] && artists[0].name,
        title: name,
      }))
  )
})

export default router.express()
