/*
 * GET home page.

- Hot Chocolate - I'll Put You Together Again contains garbage
- NTH: Implement Levenshtein in SQL
- unable to delete lyrics when stored with title only
- probably one big query for all lyrics is quicker

- log can be viewed with: sudo cat /var/log/upstart/singalong.log
- startup script: /etc/init/singalong.conf
 */
import express = require('express');
var lyrics_db = require('../scripts/lyrics_db');
var download = require("../scripts/download");
const router = express.Router();
import { SpotifyApi } from "../scripts/spotify";
import {Playlist} from "../scripts/Playlist";
import {Track} from '../scripts/Track';
import playlist_cache = require('./playlist_cache');

router.get('/authorize', (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    res.redirect(spotifyApi.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('index', {});
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    var tokens = await spotifyApi.setToken(req.query.code);
    var data = await spotifyApi.doAsyncApiCall(api => api.getUserPlaylists(null, { limit: 50 }));
    res.render('index', { playlists: data ? data.body.items : [], accessToken:tokens.body.access_token, refreshToken:tokens.body.refresh_token });
});

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var ctx = req.body;
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    var data = await spotifyApi.doAsyncApiCall(api => api.searchPlaylists(req.body.playlistQuery));
    ctx.playlists = data.body.playlists.items;
    res.render('index', ctx);
});

router.get('/playlist-without-artist', async (req: express.Request, res: express.Response) => {
    var playlist = Playlist.textualPlaylistToPlaylist(req.query.playlist);
    var textualPlaylist = await playlist.getTitlePlaylist();
    res.json(textualPlaylist);
});

router.get('/minimize-title', async (req: express.Request, res: express.Response) => {
    var playlist = Playlist.textualPlaylistToPlaylist(req.query.playlist, req.query.noArtist === 'true');
    var textualPlaylist = await playlist.getMinimalTitlePlaylist();
    res.json(textualPlaylist);
});

router.get('/find-in-database', async (req: express.Request, res: express.Response) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    var ctx: any = req.query;
    ctx.playlist = playlist_cache.get(ctx.context.userId, ctx.context.playlistId || ctx.context.albumId);
    if (!ctx.playlist) res.json(ctx);
    ctx.playlist.items = await lyrics_db.queryPlaylist(ctx.playlist.items, req.query.notDownloaded === 'true');
    ctx.textualPlaylist = await spotifyApi.playlistToText(ctx.playlist.items);
    ctx.searchedDb = true;
    res.render('playlist', ctx, (err, playlistHtml) => {
        ctx.context = ctx.playlist.getContext();
        ctx.playlist = null;
        ctx.playlistHtml = playlistHtml;
        ctx.updateTextualPlaylist = true;
        res.json(ctx);
    });
});

async function showPlaylist(res: express.Response, ctx: any, showCurrentlyPlaying: boolean = false) {
    try {
        var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
        if (!showCurrentlyPlaying)
            ctx.playlist = await spotifyApi.getFullPlaylist(ctx.context.userId, ctx.context.playlistId);
        else
            ctx.playlist = await spotifyApi.getCurrentlyPlaying();

        ctx.textualPlaylist = await spotifyApi.playlistToText(ctx.playlist.items);
        playlist_cache.store(ctx.playlist);
        res.render('playlist', ctx, (err, playlistHtml) => {
            ctx.playlistHtml = playlistHtml;
            ctx.context = ctx.playlist.getContext();
            ctx.playlist = null;
            ctx.updateTextualPlaylist = true;
            res.json(ctx);
        });
    }
    catch (err)
    {
        showError(res, 'Error retrieving playlist ' + ctx.context.playlistId + ' from database for user ' + ctx.context.userId, err);
    }
}

function removePlaylist(query) {
    var oldContext = query.context;
    if (oldContext) {
        let oldPlaylistId = oldContext.playlistId || oldContext.albumId;
        playlist_cache.remove(oldContext.userId, oldPlaylistId);
    }
    query.context = query.newContext;
}

router.get('/playlist', async (req, res) => {
    removePlaylist(req.query);
    showPlaylist(res, req.query);
});

router.get('/currently-playing', async (req, res) => {
    removePlaylist(req.query);
    showPlaylist(res, req.query, true);
});

router.get('/lyrics', async (req, res) => {
    var artist = req.query.artist;
    var title = req.query.title;
    var site = req.query.site;
    var selectedTrack = new Track(artist, title, site);
    if (site == null) {
        let track = await lyrics_db.queryTrack(selectedTrack);
        selectedTrack.lyrics = track == null ? null : track.lyrics;
    } else {
        selectedTrack.lyrics = await download.engines[site].searchLyrics(artist, title);
        selectedTrack.site = site;
    }
    res.render('track', {selectedTrack:selectedTrack, engines: download.engines}, (err, html) => {
        res.json(html);
    });
});

router.post('/lyrics', async (req, res) => {
    lyrics_db.update(new Track(req.query.artist, req.query.title), req.body.lyrics);
    showPlaylist(res, req.query);
});

router.delete('/lyrics', async (req, res) => {
    lyrics_db.remove(new Track(req.query.artist, req.query.title));
    showPlaylist(res, req.query);
});

router.get('/playlist-to-download', async (req, res) => {
    var ctx: any = req.query;
    ctx.textualPlaylist = req.query.playlist;
    ctx.playlist = Playlist.textualPlaylistToPlaylist(ctx.textualPlaylist);
    res.render('playlist',
        ctx,
        (err, playlistHtml) => {
            ctx.context = ctx.playlist.getContext();
            ctx.playlist = null;
            ctx.playlistHtml = playlistHtml;
            if (err)
                showError(res, 'Error rendering playlist', err);
            else
                res.json(ctx);
        });
});

router.get('/download-track', async (req, res) => {
    var track = await download.downloadTrack(Track.copy(req.query.track), parseInt(req.query.sleepTime));
    res.json({ track: track });
});

router.post('/songbook', async (req, res) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    var textualPlaylist = req.body.playlist;
    let context = { userId: req.body.userId, playlistId: req.body.playlistId, albumId: req.body.albumId };
    var playlist: Playlist;
    if (req.body.albumId)
        playlist = await spotifyApi.getAlbum(req.body.albumId);
    else
        playlist = textualPlaylist != null ? Playlist.textualPlaylistToPlaylist(textualPlaylist) : (await spotifyApi.getFullPlaylist(context.userId, context.playlistId));
    var tracks = await download.getLyricsFromDatabase(playlist.items, false);
    res.render('songbook', {
        book: tracks, context: context, accessToken: req.body.accessToken, refreshToken: req.body.refreshToken 
    });
});

router.get('/current-track', async (req, res) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    var currentTrack = await spotifyApi.doAsyncApiCall(async(api) => api.getMyCurrentPlayingTrack());
    let track = Track.fromSpotify(currentTrack && currentTrack.body ? currentTrack.body.item : null);
    res.json({trackName: track && track.toString(), trackId: track && track.id});
});

router.get('/play-track', async (req, res) => {
    var spotifyApi: SpotifyApi = res.locals.getSpotifyApi();
    spotifyApi.doAsyncApiCall(async (api) => {
        if (req.query.context.albumId) {
            api.play({
                context_uri: 'spotify:album:' + req.query.context.albumId,
                offset: { uri: 'spotify:track:' + req.query.trackId }
            });
        } else {
            api.play({
                context_uri: 'spotify:user:' + req.query.context.userId + ':playlist:' + req.query.context.playlistId,
                offset: { uri: 'spotify:track:' + req.query.trackId }
            });
        }

    });
    res.status(200);
});

function showError(res, message, error) {
    error = message + ": " + error;
    res.status(500).json({ error: error});
};

export default router;