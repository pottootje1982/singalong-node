import express = require('express')
const router = express.Router()

import { SpotifyApi } from '../scripts/spotify'

router.get('/:id', async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  return spotifyApi.api
    .getPlaylist(req.headers.user, req.params.id)
    .then((result) =>
      res.json(
        result.body.tracks.items.map(({ track: { id, name, artists } }) => ({
          id,
          artist: artists[0] && artists[0].name,
          title: name,
        }))
      )
    )
    .catch((err) => res.status(err.statusCode || 500).json(err))
})

export default router
