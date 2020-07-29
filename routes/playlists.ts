const router = require('./router')()

import { SpotifyApi, playlistLimit } from '../scripts/spotify'
import { createTrack } from '../scripts/track'
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
  const { userId, id } = req.params
  let offset = req.query.offset
  offset = offset && parseInt(offset)
  const { body } = offset
    ? await spotifyApi.api.getPlaylistTracks(userId, id, {
        offset,
        fields: 'items',
      })
    : await spotifyApi.api.getPlaylist(userId, id)
  let tracks = (body.tracks ? body.tracks.items : body.items)
    .filter((item) => item.track)
    .map(({ track: { id, name, artists } }) =>
      createTrack(artists[0] && artists[0].name, name, id)
    )

  tracks = await lyricsDb.queryPlaylist(tracks)
  res.json({ hasMore: tracks.length === playlistLimit, tracks })
})

export default router.express()
