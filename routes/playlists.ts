const router = require('./router')()

import { SpotifyApi, limit, createApi } from '../scripts/spotify'
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
  var spotifyApi: SpotifyApi = createApi(req)
  let { limit, offset } = req.query
  limit = limit && parseInt(limit)
  offset = offset && parseInt(offset)
  let playlists = await spotifyApi.getUserPlaylists({ limit, offset })
  res.json(playlists)
})

router.get('/currently-playing', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const playing = await spotifyApi.api.getMyCurrentPlayingTrack()
  let context = playing && playing.body.context
  let uri =
    context && context.uri && !context.uri.includes('undefined') && context.uri
  const track = playing.body && playing.body.item && playing.body.item.uri
  uri = uri || track
  return res.json({
    uri: context ? context.uri : track,
    name: 'Currently playing',
  })
})

router.get('/:uri', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const { uri } = req.params
  let { offset } = req.query
  offset = offset && parseInt(offset)
  let { tracks, hasMore } = await spotifyApi.getPlaylistFromUri(uri, { offset })
  tracks = await lyricsDb.queryPlaylist(tracks)
  return res.json({ tracks, hasMore })
})

export default router.express()
