const router = require('./router')()

import { SpotifyApi } from '../scripts/spotify'
import { Track } from '../scripts/track'
import LyricsDownloader from '../scripts/download'
import LyricsDb from '../scripts/lyrics_db'
const createTable = require('../scripts/db/tables')

let lyricsDb: LyricsDb
let lyricsDownloader: LyricsDownloader

createTable('./mongo-client', 'lyrics').then(({ lyricTable }) => {
  lyricsDb = new LyricsDb(lyricTable)
  lyricsDownloader = new LyricsDownloader(lyricsDb)
})

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
  let tracks = playlist.body.tracks.items
    .filter((item) => item.track)
    .map(
      ({ track: { id, name, artists } }) =>
        new Track(artists[0] && artists[0].name, name, null, null, null, id)
    )

  tracks = await lyricsDb.queryPlaylist(tracks)
  res.json(tracks)
})

export default router.express()
