/*
 * GET home page.
 */
import express = require('express');
var download = require("../scripts/download");
const router = express.Router();
import Spotify = require("../scripts/spotify");
var spotifyApi = Spotify.spotifyApi;
var playlistIndex = "deep purple - child in time\n" +
    "paul simon - graceland\n" +
    "beatles - yellow submarine";
var playlists;
var userId;

router.get('/', (req: express.Request, res: express.Response) => {
    spotifyApi.getMe().then(function(data) {
        userId = data.body.id;
    });
    spotifyApi.getUserPlaylists()
        .then(function (data) {
            console.log('Retrieved playlists', data.body);
            playlists = data.body.items,
            res.render('index',
                {
                    title: 'SingaLong',
                    playlistIndex: playlistIndex,
                    playlists: data.body.items,
                });
        }, function (err) {
            console.log('Something went wrong!', err);
            res.render('index',
                {
                    title: 'SingaLong',
                    playlistIndex: playlistIndex,
                    playlists: [],
                });
        });
});

router.post('/songbook', async (req, res) => {
    var book = await download.searchLyrics(req.body.playlist);
    res.render('index', {
        title: 'Express',
        lyrics: book,
        playlistIndex: playlistIndex,
        playlists: playlists
    });
});

router.post('/playlist', async (req, res) => {
    var selPlaylist = req.body.selectedPlaylist;
    Spotify.getTextualPlaylist(userId, selPlaylist).then(function (playlist) {
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