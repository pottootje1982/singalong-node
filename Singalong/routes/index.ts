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

router.get('/authorize', (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    var ctx = context(res);
    res.render('index', ctx);
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    await Spotify.setToken(req.query.code);
    var data = await spotifyApi.getMe();
    ctx.userId = data.body.id;
    data = await spotifyApi.getUserPlaylists(null, { limit: 50 });
    ctx.playlists = data.body.items;
    res.render('index', ctx);
});

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    var data = await spotifyApi.searchPlaylists(req.body.playlistQuery);
    ctx.playlists = data.body.playlists.items;
    res.render('index', ctx);
});

router.get('/playlist-without-artist', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    ctx.textualPlaylist = await Spotify.getTitlePlaylist(ctx.playlistUserId, ctx.selPlaylistId);
    res.render('index', ctx);
});

router.get('/find-in-database', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    if (!ctx.searchedDb)
        ctx.playlist = await download.getLyricsFromDatabase(ctx.playlist);
    ctx.searchedDb = true;
    res.render('index', ctx);
});

// Removes either tracks that were downloaded before,
// or tracks that are not downloaded yet
router.get('/remove', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);

    if (!ctx.searchedDb) {
        download.getLyricsFromDatabase(ctx.playlist).then(async (playlist) => {
            ctx.playlist = playlist;
            ctx.textualPlaylist = await Spotify.getDownloadedLyrics(ctx.playlist, req.query.downloaded);
            ctx.searchedDb = true;
            res.render('index', ctx);
        },
        err => ctx.showError('Error retrieving lyrics from database', err));
    } else {
        ctx.textualPlaylist = Spotify.getDownloadedLyrics(ctx.playlist, req.query.downloaded);
        res.render('index', ctx);
    }
});

router.get('/hide-selected-track', async (req: express.Request, res: express.Response) => {
    var ctx = context(res);
    ctx.selectedTrack = null;
    res.render('index', ctx);
});

function showPlaylist(ctx, res: express.Response, playlistUserId : string, selPlaylistId : string) {
    ctx.selPlaylistId = selPlaylistId;
    ctx.playlistUserId = playlistUserId;
    Spotify.getTextualPlaylist(ctx.playlistUserId, ctx.selPlaylistId).then(textualPlaylist => {
        ctx.textualPlaylist = textualPlaylist;
        var playlist = download.textualPlaylistToPlaylist(ctx.textualPlaylist);
        ctx.playlist = playlist;
        res.render('playlist', ctx, (err, playlistHtml) => {
            res.json({textualPlaylist: textualPlaylist, playlistHtml: playlistHtml});
        });
    }, err => ctx.showError('Error retrieving playlist ' + ctx.selPlaylistId + ' from database for user ' + ctx.playlistUserId, err));
}

router.get('/playlist', async (req, res) => {
    var ctx = context(res);
    ctx.searchedDb = false;
    showPlaylist(ctx, res, req.query.userId, req.query.id);
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
    res.render('track', {selectedTrack:ctx.selectedTrack, engines: ctx.engines}, (err, html) => {
        res.json(html);
    });
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

router.get('/textual-playlist-to-playlist', async (req, res) => {
    var ctx = context(res);
    ctx.textualPlaylist = req.query.playlist;
    ctx.playlist = download.textualPlaylistToPlaylist(ctx.textualPlaylist);
    res.render('playlist',
        ctx,
        (err, playlistHtml) => {
            res.json({ playlist: ctx.playlist, playlistHtml: playlistHtml });
        });
});

router.get('/download-track', async (req, res) => {
    var track = await download.downloadTrack(Track.copy(req.query.track), parseInt(req.query.sleepTime));
    res.json({ track: track });
});

router.get('/toggle-player', async (req, res) => {
    var ctx = context(res);
    ctx.showSpotifyPlayer = !ctx.showSpotifyPlayer;
    res.render('index', ctx);
});

router.post('/songbook', async (req, res) => {
    var ctx = context(res);
    ctx.textualPlaylist = req.body.playlist;
    var playlist = download.textualPlaylistToPlaylist(ctx.textualPlaylist);
    playlist = await download.getLyricsFromDatabase(playlist, false);
    res.render('songbook', {
        book: playlist,
    });
});

router.get('/songbook-downloaded', async (req, res) => {
    var ctx = context(res);
    var playlist = await download.getLyricsFromDatabase(ctx.playlist, false);
    res.render('songbook', {
        book: playlist,
    });
});

router.get('/current-track', async (req, res) => {
    var currentTrack = await spotifyApi.getMyCurrentPlayingTrack();
    let fromSpotify = Track.fromSpotify(currentTrack.body.item);
    res.json({trackName: fromSpotify.toString()});
});

function context(res) {
    return res.locals.context;
}

export default router;