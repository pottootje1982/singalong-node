﻿/*
 * GET home page.

- unable to delete lyrics when stored with title only
- if doing a custom search, the selected track title doesn't get updated
- add current track position in minutes:seconds next to track slider
- on active window set current play status:
- https://stackoverflow.com/questions/6966733/detect-tab-window-activation-in-javascript
- select device on which to play
- use memory cache to store playlists

- playlist refresh error when switching too fast between playlists
- play button in playlist doesn't work
- timer too big in mobile

- log can be viewed with: sudo cat /var/log/upstart/singalong.log
- startup script: /etc/init/singalong.conf
 */
import express = require("express")
const router = express.Router()
import { SpotifyApi } from "../scripts/spotify"
import { Playlist } from "../scripts/Playlist"
import { Track } from "../scripts/track"
import LyricsDb from "../scripts/lyrics_db"
import playlist_cache = require("./playlist_cache")
import LyricsDownloader from "../scripts/download"
const createTable = require("../scripts/db/tables")

let lyricsDb: LyricsDb
let lyricsDownloader: LyricsDownloader

createTable("./mongo-client", "lyrics").then(({ lyricTable }) => {
  lyricsDb = new LyricsDb(lyricTable)
  lyricsDownloader = new LyricsDownloader(lyricsDb)
})

router.get("/", (req: express.Request, res: express.Response) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  res.redirect(spotifyApi.getAuthorizeUrl())
})

router.get("/manual", async (req: express.Request, res: express.Response) => {
  res.render("index", {})
})

router.get(
  "/authorized",
  async (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
    var tokens = await spotifyApi.setToken(req.query.code)
    var data = await spotifyApi.api.getUserPlaylists(null, { limit: 50 })
    var playlists = data ? data.body.items : []
    res.render("index", {
      playlists: playlists,
      accessToken: tokens.body.access_token,
      refreshToken: tokens.body.refresh_token,
      context: {
        playlistId: playlists[0] && playlists[0].id,
        userId: playlists[0] && playlists[0].owner.id
      }
    })
  }
)

router.post(
  "/search-playlists",
  async (req: express.Request, res: express.Response) => {
    var ctx = req.body
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
    var data = await spotifyApi.doAsyncApiCall(api =>
      api.searchPlaylists(req.body.playlistQuery)
    )
    ctx.playlists = data.body.playlists.items
    res.render("index", ctx)
  }
)

router.get(
  "/refreshToken",
  async (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
    var data = await spotifyApi.refreshAccessToken()
    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token
    })
  }
)

router.get(
  "/playlist-without-artist",
  async (req: express.Request, res: express.Response) => {
    var playlist = Playlist.textualPlaylistToPlaylist(req.query.playlist)
    var textualPlaylist = await playlist.getTitlePlaylist()
    res.json(textualPlaylist)
  }
)

router.get(
  "/minimize-title",
  async (req: express.Request, res: express.Response) => {
    var playlist = Playlist.textualPlaylistToPlaylist(
      req.query.playlist,
      req.query.noArtist === "true"
    )
    var textualPlaylist = await playlist.getMinimalTitlePlaylist()
    res.json(textualPlaylist)
  }
)

var cachedUrl

router.get("/proxy", async (req: express.Request, res: express.Response) => {
  res.render("proxy", { webUrl: cachedUrl })
})

router.post("/proxy", async (req: express.Request, res: express.Response) => {
  cachedUrl = req.body.webUrl
  res.render("proxy", { webUrl: cachedUrl })
})

router.get(
  "/find-in-database",
  async (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
    var ctx: any = req.query
    ctx.playlist = playlist_cache.get(
      ctx.context.userId,
      ctx.context.playlistId || ctx.context.albumId
    )
    if (!ctx.playlist) res.json(ctx)
    try {
      ctx.playlist.items = await lyricsDb.queryPlaylist(
        ctx.playlist.items,
        req.query.notDownloaded === "true"
      )
    } catch (e) {
      console.log("Error when querying lyrics database:", e)
    }
    ctx.textualPlaylist = await spotifyApi.playlistToText(ctx.playlist.items)
    ctx.searchedDb = true
    res.render("playlist", ctx, (err, playlistHtml) => {
      ctx.context = ctx.playlist.getContext()
      ctx.playlist = null
      ctx.playlistHtml = playlistHtml
      ctx.updateTextualPlaylist = true
      ctx.canCreateSongbook = true
      res.json(ctx)
    })
  }
)

async function showPlaylist(
  res: express.Response,
  ctx: any,
  showCurrentlyPlaying: boolean = false
) {
  try {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
    ctx.offset = isNaN(ctx.offset) ? 0 : +ctx.offset
    if (ctx.offset === 0) removePlaylist(ctx)
    ctx.playlist = playlist_cache.get(
      ctx.context.userId,
      ctx.context.playlistId || ctx.context.albumId
    )
    if (!showCurrentlyPlaying)
      ctx.playlist = await spotifyApi.getPlaylist(
        ctx.playlist,
        ctx.context.userId,
        ctx.context.playlistId,
        ctx.offset
      )
    else ctx.playlist = await spotifyApi.getCurrentlyPlaying()

    ctx.offset = ctx.playlist.offset
    ctx.textualPlaylist = await spotifyApi.playlistToText(ctx.playlist.items)
    playlist_cache.store(ctx.playlist)
    res.render("playlist", ctx, (err, playlistHtml) => {
      ctx.playlistHtml = playlistHtml
      ctx.context = ctx.playlist.getContext()
      ctx.hasMore = ctx.playlist.hasMore()
      ctx.playlist = null
      ctx.updateTextualPlaylist = true
      res.json(ctx)
    })
  } catch (err) {
    showError(
      res,
      `Error retrieving playlist ${ctx.context.playlistId} from database for user ${ctx.context.userId}`,
      err
    )
  }
}

function removePlaylist(query) {
  var oldContext = query.context
  if (oldContext) {
    let oldPlaylistId = oldContext.playlistId || oldContext.albumId
    playlist_cache.remove(oldContext.userId, oldPlaylistId)
  }
  if (query.newContext) query.context = query.newContext
}

router.get("/playlist", async (req: express.Request, res: express.Response) => {
  showPlaylist(res, req.query)
})

router.get("/currently-playing", async (req, res) => {
  showPlaylist(res, req.query, true)
})

router.get("/lyrics", async (req, res) => {
  var artist = req.query.artist
  var title = req.query.title
  var site = req.query.site
  var selectedTrack = new Track(artist, title, site)
  req.query.selectedTrack = selectedTrack
  req.query.engines = lyricsDownloader.engines
  selectedTrack.id = req.query.id
  if (site == null) {
    let track = await lyricsDb.queryTrack(selectedTrack)
    selectedTrack.lyrics = track == null ? null : track.lyrics
  } else {
    selectedTrack.lyrics = await lyricsDownloader.engines[site].searchLyrics(
      artist,
      title
    )
    selectedTrack.site = site
  }
  res.render("track", req.query, (err, html) => {
    req.query.trackHtml = html
    res.json(req.query)
  })
})

router.post("/lyrics", async (req, res) => {
  let track = new Track(req.query.artist, req.query.title)
  track.id = req.query.id
  lyricsDb.updateOrInsert(track, req.body.lyrics)
  showPlaylist(res, req.query)
})

router.delete("/lyrics", async (req, res) => {
  lyricsDb.remove(new Track(req.query.artist, req.query.title))
  showPlaylist(res, req.query)
})

router.get("/playlist-to-download", async (req, res) => {
  var ctx: any = req.query
  ctx.textualPlaylist = req.query.playlist
  ctx.playlist = Playlist.textualPlaylistToPlaylist(ctx.textualPlaylist)
  res.render("playlist", ctx, (err, playlistHtml) => {
    ctx.context = ctx.playlist.getContext()
    ctx.playlist = null
    ctx.playlistHtml = playlistHtml
    if (err) showError(res, "Error rendering playlist", err)
    else res.json(ctx)
  })
})

router.get("/download-track", async (req, res) => {
  var track = await lyricsDownloader.downloadTrack(
    Track.copy(req.query.track),
    parseInt(req.query.sleepTime),
    req.query.getCached !== "false"
  )
  res.json({ track: track })
})

router.post("/songbook", async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  var textualPlaylist = req.body.playlist
  var context: any = req.body
  context.offset = context.offset || 0
  var playlist: Playlist
  if (req.body.albumId) playlist = await spotifyApi.getAlbum(req.body.albumId)
  else {
    playlist =
      textualPlaylist != null
        ? Playlist.textualPlaylistToPlaylist(textualPlaylist)
        : playlist_cache.get(
            context.userId,
            context.playlistId || context.albumId
          )
  }
  var tracks = playlist.items.filter(t => t.lyrics != null)
  context.playlistName = playlist.name
  res.render("songbook", {
    invoke: req.query.invoke,
    book: tracks,
    context: context,
    accessToken: req.body.accessToken,
    refreshToken: req.body.refreshToken
  })
})

router.get("/current-track", async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  var currentTrack = await spotifyApi.api.getMyCurrentPlayingTrack()
  let track: any = Track.fromSpotify(
    currentTrack && currentTrack.body ? currentTrack.body.item : null
  )
  if (track) {
    track.progress_ms = currentTrack.body.progress_ms
    track.is_playing = currentTrack.body.is_playing
  }
  res.json(track)
})

router.get("/play-track", async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  if (req.query.context.albumId) {
    spotifyApi.api.play({
      context_uri: "spotify:album:" + req.query.context.albumId,
      offset: { uri: "spotify:track:" + req.query.id }
    })
  } else {
    spotifyApi.api.play({
      context_uri:
        "spotify:user:" +
        req.query.context.userId +
        ":playlist:" +
        req.query.context.playlistId,
      offset: { uri: "spotify:track:" + req.query.id }
    })
  }
  res.json(req.query)
})

router.get("/toggle-play", async (req, res) => {
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  var isPlaying = req.query.play === "true"
  if (isPlaying) await spotifyApi.api.play()
  else await spotifyApi.api.pause()
  res.json({ is_playing: isPlaying })
})

router.get("/skip-to-track", async (req, res) => {
  var context = req.query.context
  var playlist = playlist_cache.get(context.userId, context.playlistId)
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  let api = spotifyApi.api
  var data = await api.getMyCurrentPlaybackState()
  var id = data.body.item.id
  var track: any
  if (req.query.withLyrics === "true") {
    track = playlist.getNextTrackWithLyrics(id, req.query.next === "true")
  } else {
    track = playlist.getNextTrack(id, req.query.next === "true")
  }
  api.play({
    context_uri:
      "spotify:user:" +
      req.query.context.userId +
      ":playlist:" +
      req.query.context.playlistId,
    offset: { uri: "spotify:track:" + track.id }
  })

  track.progress_ms = 0
  track.is_playing = data.body.is_playing
  res.json(track)
})

router.get("/seek", async (req, res) => {
  var query = req.query
  var spotifyApi: SpotifyApi = res.locals.getSpotifyApi()
  await spotifyApi.api.seek(query.position_ms)
  res.json({})
})

function showError(res, message, error) {
  error = message + ": " + error
  res.status(500).json({ error: error })
}

export default router
