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
var state = {
    textualPlaylist: '',
    playlists: [],
    playlist: [],
    selectedTrack: null,
    selPlaylistId: null,
    playlistUserId: null,
    engines: download.engines
}
var userId;

router.get('/authorize', (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('index', state);
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    await Spotify.setToken(req.query.code);
    var data = await spotifyApi.getMe();
    userId = data.body.id;
    data = await spotifyApi.getUserPlaylists(userId, { limit: 50 });
    state.playlists = data.body.items;
    let firstPlaylist = state.playlists[0].id;
    displayPlaylist(res, userId, firstPlaylist);
});

function displayPlaylist(res: express.Response, userId: string, playlistId: string) {
    res.redirect('/playlist?userId=' + userId + '&id=' + playlistId);
}

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var data = await spotifyApi.searchPlaylists(req.body.playlistQuery);
    state.playlists = data.body.playlists.items;
    if (state.playlists.length > 0) {
        let firstPlaylist = state.playlists[0];
        var playlistUserId = firstPlaylist.owner.id;
        displayPlaylist(res, playlistUserId, firstPlaylist.id);
    }
    else 
        res.render('index', state);
});

router.get('/playlist-without-artist', async (req: express.Request, res: express.Response) => {
    state.textualPlaylist = await Spotify.getTitlePlaylist(state.playlistUserId, state.selPlaylistId);
    res.render('index', state);
});

router.get('/find-in-database', async (req: express.Request, res: express.Response) => {
    state.playlist = await download.getLyricsFromDatabase(state.playlist);
    res.render('index', state);
});

router.get('/playlist', async (req, res) => {
    state.selPlaylistId = req.query.id;
    state.playlistUserId = req.query.userId;
    state.textualPlaylist = await Spotify.getTextualPlaylist(state.playlistUserId, state.selPlaylistId);
    var playlist = download.textualPlaylistToPlaylist(state.textualPlaylist);
    state.playlist = playlist;
    res.render('index', state);
});

router.get('/lyrics', async (req, res) => {
    var artist = req.query.artist;
    var title = req.query.title;
    var site = req.query.site;
    state.selectedTrack = new Track(artist, title, site);
    if (site == null) {
        let track = await lyrics_db.queryTrack(state.selectedTrack);
        state.selectedTrack.lyrics = track == null ? null : track.lyrics;
    } else {
        state.selectedTrack.lyrics = await download.engines[site].searchLyrics(artist, title);
        state.selectedTrack.site = site;
    }
    res.render('index', state);
});

router.post('/lyrics', async (req, res) => {
    state.selectedTrack.lyrics = req.body.lyrics;
    lyrics_db.update(state.selectedTrack, req.body.lyrics);
    res.render('index', state);
});

router.delete('/lyrics', async (req, res) => {
    lyrics_db.remove(state.selectedTrack);
    res.render('index', state);
});


router.post('/songbook', async (req, res) => {
    state.textualPlaylist = req.body.playlist;
    var book = await download.createSongbook(state.textualPlaylist, parseInt(req.body.sleepTime));
    res.render('songbook', {
        book: book,
    });
});

export default router;