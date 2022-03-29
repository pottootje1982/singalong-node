const router = require('./router')()

import { SpotifyApi, createApi } from '../scripts/spotify'
import { Track } from '../client/src/track'
const db = require('../scripts/db/databases')

router.get('/', async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req)
  let { limit, offset } = req.query
  limit = limit && parseInt(limit)
  offset = offset && parseInt(offset)
  const { playlists, hasMore } = await spotifyApi.getUserPlaylists({ limit, offset })
  const playlistsMetaDb = await db.playlists()
  const result = await playlistsMetaDb.hydrate(playlists)
  res.json({ playlists: result, hasMore })
})

router.post('/custom', async (req, res) => {
  const spotifyApi = createApi(req)
  const owner = await spotifyApi.owner()
  const { tracksString, name } = req.body
  const customPlaylistsDb = await db.customPlaylists()
  const playlist = await customPlaylistsDb.insert(owner, tracksString, name)
  await customPlaylistsDb.close()
  res.json({ playlist })
})

router.put('/custom', async (req, res) => {
  const { tracksString, name, id } = req.body
  const customPlaylistsDb = await db.customPlaylists()
  const playlist = await customPlaylistsDb.update(id, tracksString, name)
  await customPlaylistsDb.close()
  res.json({ playlist })
})

router.get('/custom', async (req, res) => {
  const spotifyApi = createApi(req)
  const owner = await spotifyApi.owner()
  const customPlaylistsDb = await db.customPlaylists()
  const playlists = await customPlaylistsDb.get(owner)
  await customPlaylistsDb.close()
  res.json({ playlists })
})

router.get('/:id/custom', async (req, res) => {
  const spotifyApi = createApi(req)
  const customPlaylistsDb = await db.customPlaylists()
  const owner = await spotifyApi.owner()
  const playlists = (await customPlaylistsDb.get(owner, req.params.id)) || []
  let { tracks } = playlists[0] || {}
  const { lyricsDb } = await db.lyrics()
  tracks = await lyricsDb.queryPlaylist((tracks || []).map(Track.copy))
  await lyricsDb.close()
  await customPlaylistsDb.close()
  res.json({ tracks })
})

router.delete('/:id/custom', async (req, res) => {
  const customPlaylistsDb = await db.customPlaylists()
  const found = await customPlaylistsDb.remove(req.params.id)
  await customPlaylistsDb.close()
  res.sendStatus(found.deletedCount > 1 ? 204 : 404)
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
  await lyricsDb.close()
  res.json({ tracks, hasMore })
})

router.post('/:uri', async (req, res) => {
  const playlists = await db.playlists()
  const { uri } = req.params
  await playlists.update(uri, req.body)
  playlists.close()
  res.json({})
})

export default router.express()
