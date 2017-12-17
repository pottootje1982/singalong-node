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
import {Context} from '../scripts/contextMapper';

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

// Removes either tracks that were downloaded before,
// or tracks that are not downloaded yet
router.get('/filter-on-download-status', async (req: express.Request, res: express.Response) => {
    showPlaylist(res, req.query.userId, req.query.playlistId, true);
});

async function showPlaylist(res: express.Response, playlistUserId: string, selPlaylistId: string, getLyrics: boolean = false) {
    var ctx: any = { selPlaylistId: selPlaylistId, playlistUserId: playlistUserId};
    try {
        ctx.playlist = await Spotify.getFullPlaylist(playlistUserId, selPlaylistId);
        if (getLyrics) {
            ctx.playlist = await download.getLyricsFromDatabase(ctx.playlist, false);
            ctx.textualPlaylist = await Spotify.getDownloadedLyrics(ctx.playlist);
            ctx.searchedDb = true;
        } else {
            ctx.textualPlaylist = await Spotify.playlistToText(ctx.playlist);
        }
        res.render('playlist', ctx, (err, playlistHtml) => {
            res.json({ textualPlaylist: ctx.textualPlaylist, playlistHtml: playlistHtml });
        });
    }
    catch (err)
    {
        showError(res, 'Error retrieving playlist ' + ctx.selPlaylistId + ' from database for user ' + ctx.playlistUserId, err);
    }
}

router.get('/playlist', async (req, res) => {
    showPlaylist(res, req.query.userId, req.query.id);
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
    lyrics_db.update(new Track(req.body.track, req.body.title), req.body.lyrics);
    res.json();
});

router.delete('/lyrics', async (req, res) => {
    lyrics_db.remove(new Track(req.body.track, req.body.title));
    res.json();
});

router.get('/playlist-to-download', async (req, res) => {
    var ctx: any = {};
    var textualPlaylist: string = req.query.playlist;
    ctx.playlist = download.textualPlaylistToPlaylist(textualPlaylist);
    res.render('playlist',
        ctx,
        (err, playlistHtml) => {
            res.json({ playlistHtml: playlistHtml, textualPlaylist: textualPlaylist });
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
    res.status(500).json({ message: message, error: error});
};

export default router;