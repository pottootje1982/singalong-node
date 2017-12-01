/*
 * GET home page.

- Rotate search engines
- Give back partial results

 */
import express = require('express');
var download = require("../scripts/download");
const router = express.Router();
import Spotify = require("../scripts/spotify");
var spotifyApi = Spotify.spotifyApi;
import Download = require("../scripts/download");
var playlistIndex = "deep purple - child in time\n" +
    "paul simon - graceland\n" +
    "beatles - yellow submarine";
var playlists;
var userId;

router.get('/', (req: express.Request, res: express.Response) => {
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/authorized', (req: express.Request, res: express.Response) => {
    Spotify.setToken(req.query.code)
        .then(() => {
            spotifyApi.getMe().then(data => {
                userId = data.body.id;
                spotifyApi.getUserPlaylists(userId, {limit:50})
                    .then(data => {
                        console.log('Retrieved playlists', data.body);
                        playlists = data.body.items,
                        Spotify.getTextualPlaylist(userId, playlists[0].id).then(playlist => {
                            playlistIndex = playlist;
                            res.render('index',
                                {
                                    title: 'Express',
                                    playlistIndex: playlistIndex,
                                    lyrics: '',
                                    playlists: playlists
                                });
                        }, err => errorHandler(res, err));
                    }, err => errorHandler(res, err));
            }, err => errorHandler(res, err));
        }, err => errorHandler(res, err));
});

function errorHandler(res, err) {
    console.log('Something went wrong!', err);
    res.render('index',
        {
            title: 'SingaLong',
            playlistIndex: playlistIndex,
            playlists: [],
        });
}

router.post('/songbook', async (req, res) => {
    var book = await download.createSongbook(req.body.playlist, Download.engines["MusixMatch"], parseInt(req.body.sleepTime));
    res.render('index', {
        title: 'Express',
        lyrics: book,
        playlistIndex: playlistIndex,
        playlists: playlists
    });
});

router.get('/playlist', async (req, res) => {
    var selPlaylist = req.query.id;
    Spotify.getTextualPlaylist(userId, selPlaylist).then(playlist => {
        playlistIndex = playlist;
        res.render('index',
            {
                title: 'Express',
                playlistIndex: playlistIndex,
                lyrics: '',
                playlists: playlists
            });
    });
});

export default router;