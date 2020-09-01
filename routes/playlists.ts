const router = require('./router')()

import { SpotifyApi, playlistLimit, createApi } from '../scripts/spotify'
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
  var spotifyApi: SpotifyApi = createApi(req)
  let { body } = await spotifyApi.api.getUserPlaylists(req.query.user, {
    limit: 50,
  })
  const playlists = body ? body.items : []
  res.json(playlists)
})

router.get('/currently-playing', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const playing = await spotifyApi.api.getMyCurrentPlayingTrack()
  const result = []
  let context = playing && playing.body.context
  let uri =
    context && context.uri && !context.uri.includes('undefined') && context.uri
  const track = playing.body && playing.body.item && playing.body.item.uri
  uri = uri || track
  if (uri)
    result.push({
      uri: context ? context.uri : track,
      name: 'Currently playing',
    })
  return res.json(result)
})

router.get('/:uri', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  let tracks = await spotifyApi.getPlaylistFromUri(req.params.uri)
  tracks = tracks.map(({ id, name, artists }) =>
    createTrack(artists[0] && artists[0].name, name, id)
  )
  tracks = await lyricsDb.queryPlaylist(tracks)
  return res.json({ tracks })
})

router.get('/:id/users/:userId', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
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
