const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'
import { Track, createTrack } from '../client/src/track'

router.post('/search', async (req, res) => {
  const spotifyApi: SpotifyApi = createApi(req)
  const { tracks: tracksToSearch } = req.body
  const results: Array<any> = await Promise.all(
    tracksToSearch.map((t) =>
      spotifyApi.api.search(Track.copy(t).toString(), ['track'])
    )
  )
  const tracks = results.map((result) => {
    const t = result.body.tracks.items[0]
    return t ? createTrack(t) : {}
  })
  res.json({ tracks })
})

export default router.express()
