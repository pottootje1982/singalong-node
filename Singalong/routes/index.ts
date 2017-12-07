/*
 * GET home page.

- Give back partial results when creating songbook
- Hot Chocolate - I'll Put You Together Again contains garbage
- NTH: Implement Levenshtein in SQL
- unable to delete lyrics when stored with title only
- Cancel search

 */
import express = require('express');
var lyrics_db = require('../scripts/lyrics_db');
var download = require("../scripts/download");
const router = express.Router();
import Spotify = require("../scripts/spotify");
var spotifyApi;
import {Track} from '../scripts/Track';

router.get('/authorize', (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    res.render('index', ctx);
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    await Spotify.setToken(req.query.code);
    var data = await spotifyApi.getMe();
    ctx.userId = data.body.id;
    data = await spotifyApi.getUserPlaylists(ctx.userId, { limit: 50 });
    ctx.playlists = data.body.items;
    let firstPlaylist = ctx.playlists[0].id;
    displayPlaylist(res, ctx.userId, firstPlaylist);
});

function displayPlaylist(res: express.Response, userId: string, playlistId: string) {
    var ctx = context(res);
    res.redirect('/playlist?userId=' + ctx.userId + '&id=' + playlistId);
}

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    var data = await spotifyApi.searchPlaylists(req.body.playlistQuery);
    ctx.playlists = data.body.playlists.items;
    if (ctx.playlists.length > 0) {
        let firstPlaylist = ctx.playlists[0];
        var playlistUserId = firstPlaylist.owner.id;
        displayPlaylist(res, playlistUserId, firstPlaylist.id);
    }
    else 
        res.render('index', ctx);
});

router.get('/playlist-without-artist', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    ctx.textualPlaylist = await Spotify.getTitlePlaylist(ctx.playlistUserId, ctx.selPlaylistId);
    res.render('index', ctx);
});

router.get('/find-in-database', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    ctx.playlist = await download.getLyricsFromDatabase(ctx.playlist);
    res.render('index', ctx);
});

router.get('/remove', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);

    download.getLyricsFromDatabase(ctx.playlist).then(async(playlist) => {
        ctx.playlist = playlist;
        ctx.textualPlaylist = await Spotify.getDownloadedLyrics(ctx.playlist, req.query.downloaded);
        res.render('index', ctx);
    });
});

router.get('/playlist', async (req, res) => {
    var ctx = context(res);
    ctx.selPlaylistId = req.query.id;
    ctx.playlistUserId = req.query.userId;
    ctx.textualPlaylist = await Spotify.getTextualPlaylist(ctx.playlistUserId, ctx.selPlaylistId);
    var playlist = download.textualPlaylistToPlaylist(ctx.textualPlaylist);
    ctx.playlist = playlist;
    res.render('index', ctx);
});

router.get('/lyrics', async (req, res) => {
    var ctx = context(res);
    var artist = req.query.artist;
    var title = req.query.title;
    var site = req.query.site;
    ctx.selectedTrack = new Track(artist, title, site);
    if (site == null) {
        let track = await lyrics_db.queryTrack(ctx.selectedTrack);
        ctx.selectedTrack.lyrics = track == null ? null : track.lyrics;
    } else {
        ctx.selectedTrack.lyrics = await download.engines[site].searchLyrics(artist, title);
        ctx.selectedTrack.site = site;
    }
    res.render('index', ctx);
});

router.post('/lyrics', async (req, res) => {
    var ctx = context(res);
    ctx.selectedTrack.lyrics = req.body.lyrics;
    lyrics_db.update(ctx.selectedTrack, req.body.lyrics);
    res.render('index', ctx);
});

router.delete('/lyrics', async (req, res) => {
    var ctx = context(res);
    lyrics_db.remove(ctx.selectedTrack);
    res.render('index', ctx);
});


router.post('/songbook', async (req, res) => {
    var ctx = context(res);
    ctx.textualPlaylist = req.body.playlist;
    var book = await download.createSongbook(ctx.textualPlaylist, parseInt(req.body.sleepTime));
    res.render('songbook', {
        book: book,
    });
});

function context(res) {
    return res.locals.context;
}

export default router;