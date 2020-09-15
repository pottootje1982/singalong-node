const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'
import { Track } from '../client/src/track'
const { v4: uuid } = require('uuid')
const db = require('../scripts/db/databases')

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  let { limit, offset } = req.query
  limit = limit && parseInt(limit)
  offset = offset && parseInt(offset)
  let playlists = await spotifyApi.getUserPlaylists({ limit, offset })
  res.json(playlists)
})

router.post('/', async (req, res) => {
  const playlistText = req.body.playlist
  const name = req.body.name
  const lines = playlistText.match(/[^\r\n]+/g)
  const tracks = lines.map((l) => ({ ...Track.parse(l), id: uuid() }))
  const playlist = {
    id: uuid(),
    name,
    tracks,
  }
  const { playlistsDb } = await db.playlists()
  await playlistsDb.insert(playlist)
  res.json({ playlist })
})

router.get('/custom', async (req, res) => {
  const { playlistsDb } = await db.playlists()
  const playlists = await playlistsDb.get()
  res.json({ playlists })
})

router.get('/:id/custom', async (req, res) => {
  const { playlistsDb } = await db.playlists()
  const playlists = (await playlistsDb.get(req.params.id)) || []
  let { tracks } = playlists[0] || {}
  const { lyricsDb } = await db.lyrics()
  tracks = await lyricsDb.queryPlaylist((tracks || []).map(Track.copy))
  res.json({ tracks })
})

router.get('/currently-playing', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const playing = await spotifyApi.api.getMyCurrentPlayingTrack()
  let context = playing && playing.body.context
  let uri =
    context && context.uri && !context.uri.includes('undefined') && context.uri
  const track = playing.body && playing.body.item && playing.body.item.uri
  uri = uri || track
  res.json({
    uri: context ? context.uri : track,
    name: 'Currently playing',
  })
})

router.get('/:uri', async (req, res) => {
  const { lyricsDb } = await db.lyrics()
  var spotifyApi: SpotifyApi = createApi(req)
  const { uri } = req.params
  let { offset } = req.query
  offset = offset && parseInt(offset)
  let { tracks, hasMore } = await spotifyApi.getPlaylistFromUri(uri, { offset })
  tracks = await lyricsDb.queryPlaylist(tracks)
  res.json({ tracks, hasMore })
})

router.post('/:uri/tracks', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  const { uri } = req.params
  const { uris } = req.body
  spotifyApi.addToPlaylist(uri, uris)
  res.status(200)
})

export default router.express()
