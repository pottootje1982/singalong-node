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
import Spotify = require("../scripts/spotify");
var spotifyApi;
import {Track} from '../scripts/Track';
import { Context } from '../scripts/contextMapper';
import playlist_cache = require('./playlist_cache');

router.get('/authorize', (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    var emptyContext = new Context();
    spotifyApi = Spotify.getApi(req.headers.host);
    res.render('index', emptyContext);
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    var emptyContext = new Context();
    await Spotify.setToken(req.query.code);
    var data = await spotifyApi.getUserPlaylists(null, { limit: 50 });
    emptyContext.playlists = data.body.items;
    res.render('index', emptyContext);
});

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var emptyContext = new Context();
    var data = await spotifyApi.searchPlaylists(req.body.playlistQuery);
    emptyContext.playlists = data.body.playlists.items;
    res.render('index', emptyContext);
});

router.get('/playlist-without-artist', async (req: express.Request, res: express.Response) => {
    var textualPlaylist = await Spotify.getTitlePlaylist(req.query.userId, req.query.playlistId);
    res.json(textualPlaylist);
});

router.get('/find-in-database', async (req: express.Request, res: express.Response) => {
    var ctx: any = { userId: req.query.userId, playlistId: req.query.playlistId };
    var cachedEntry = playlist_cache.get(req.query.userId, req.query.playlistId);
    ctx.playlist = await lyrics_db.queryPlaylist(cachedEntry.playlist, req.query.notDownloaded);
    ctx.textualPlaylist = await Spotify.playlistToText(ctx.playlist);
    ctx.searchedDb = true;
    res.render('playlist', ctx, (err, playlistHtml) => {
        ctx.playlist = null;
        ctx.playlistHtml = playlistHtml;
        res.json(ctx);
    });
});

async function showPlaylist(res: express.Response, userId: string, playlistId: string) {
    var ctx: any = { userId: userId, playlistId: playlistId };
    try {
        ctx.playlist = await Spotify.getFullPlaylist(userId, playlistId);
        ctx.textualPlaylist = await Spotify.playlistToText(ctx.playlist);
        playlist_cache.store(userId, playlistId, ctx.playlist);
        res.render('playlist', ctx, (err, playlistHtml) => {
            ctx.playlistHtml = playlistHtml;
            ctx.playlist = null;
            res.json(ctx);
        });
    }
    catch (err)
    {
        showError(res, 'Error retrieving playlist ' + ctx.playlistId + ' from database for user ' + ctx.userId, err);
    }
}

router.get('/playlist', async (req, res) => {
    playlist_cache.remove(req.query.oldUserId, req.query.oldPlaylistId);
    showPlaylist(res, req.query.userId, req.query.playlistId);
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
    lyrics_db.update(new Track(req.body.artist, req.body.title), req.body.lyrics);
    res.json({});
});

router.delete('/lyrics', async (req, res) => {
    lyrics_db.remove(new Track(req.body.artist, req.body.title));
    showPlaylist(res, req.body.userId, req.body.playlistId);
});

router.get('/playlist-to-download', async (req, res) => {
    var ctx: any = { userId: req.query.userId, playlistId: req.query.playlistId };
    ctx.textualPlaylist = req.query.playlist;
    ctx.playlist = download.textualPlaylistToPlaylist(ctx.textualPlaylist);
    res.render('playlist',
        ctx,
        (err, playlistHtml) => {
            ctx.playlist = null;
            ctx.playlistHtml = playlistHtml;
            res.json(ctx);
        });
});

router.get('/download-track', async (req, res) => {
    var track = await download.downloadTrack(Track.copy(req.query.track), parseInt(req.query.sleepTime));
    res.json({ track: track });
});

router.post('/songbook', async (req, res) => {
    var textualPlaylist = req.body.playlist;
    var playlist = textualPlaylist != null ? download.textualPlaylistToPlaylist(textualPlaylist) : await Spotify.getFullPlaylist(req.body.userId, req.body.playlistId);
    playlist = await download.getLyricsFromDatabase(playlist, false);
    res.render('songbook', {
        book: playlist,
    });
});

router.get('/current-track', async (req, res) => {
    var currentTrack = await spotifyApi.getMyCurrentPlayingTrack();
    let fromSpotify = Track.fromSpotify(currentTrack.body.item);
    res.json({trackName: fromSpotify.toString()});
});

router.post('/play-track', async (req, res) => {
    await spotifyApi.play({
        context_uri: 'spotify:user:' + req.body.userId + ':playlist:' + req.body.playlistId,
        offset: {uri: 'spotify:track:' + req.body.trackId } 
    });
    res.json();
});

function showError(res, message, error) {
    error = message + ": " + error;
    res.status(500).json({ error: error});
};

export default router;