﻿/*
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
import {Playlist} from "../scripts/Playlist";
var spotifyApi;
import {Track} from '../scripts/Track';
import playlist_cache = require('./playlist_cache');

router.get('/authorize', (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.redirect(Spotify.getAuthorizeUrl());
});

router.get('/', async (req: express.Request, res: express.Response) => {
    spotifyApi = Spotify.getApi(req.headers.host);
    res.render('index', {});
});

router.get('/authorized', async (req: express.Request, res: express.Response) => {
    await Spotify.setToken(req.query.code);
    var data = await spotifyApi.getUserPlaylists(null, { limit: 50 });
    res.render('index', { playlists: data.body.items });
});

router.post('/search-playlists', async (req: express.Request, res: express.Response) => {
    var data = await spotifyApi.searchPlaylists(req.body.playlistQuery);
    res.render('index', { playlists: data.body.playlists.items });
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
    var ctx: any = req.query.context;
    ctx.playlist = playlist_cache.get(ctx.userId, ctx.playlistId || ctx.albumId);
    ctx.playlist.items = await lyrics_db.queryPlaylist(ctx.playlist.items, req.query.notDownloaded);
    ctx.textualPlaylist = await Spotify.playlistToText(ctx.playlist.items);
    ctx.searchedDb = true;
    res.render('playlist', ctx, (err, playlistHtml) => {
        ctx.context = ctx.playlist.getContext();
        ctx.playlist = null;
        ctx.playlistHtml = playlistHtml;
        ctx.updateTextualPlaylist = true;
        res.json(ctx);
    });
});

async function showPlaylist(res: express.Response, ctx: any) {
    try {
        if (ctx.userId && ctx.playlistId)
            ctx.playlist = await Spotify.getFullPlaylist(ctx.userId, ctx.playlistId);
        else
            ctx.playlist = await Spotify.getCurrentlyPlaying();

        ctx.textualPlaylist = await Spotify.playlistToText(ctx.playlist.items);
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
        showError(res, 'Error retrieving playlist ' + ctx.playlistId + ' from database for user ' + ctx.userId, err);
    }
}

function removePlaylist(oldContext) {
    if (oldContext) {
        let oldPlaylistId = oldContext.playlistId || oldContext.albumId;
        playlist_cache.remove(oldContext.userId, oldPlaylistId);
    }
}

router.get('/playlist', async (req, res) => {
    removePlaylist(req.query.oldContext);
    showPlaylist(res, req.query.context);
});

router.get('/currently-playing', async (req, res) => {
    removePlaylist(req.query.oldContext);
    showPlaylist(res, {});
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
    showPlaylist(res, req.body.context);
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
    var textualPlaylist = req.body.playlist;
    let userId = req.body.userId;
    let playlistId = req.body.playlistId;
    var playlist = textualPlaylist != null ? Playlist.textualPlaylistToPlaylist(textualPlaylist) : (await Spotify.getFullPlaylist(userId, playlistId)).items;
    playlist = await download.getLyricsFromDatabase(playlist, false);
    res.render('songbook', {
        book: playlist, userId: userId, playlistId:playlistId
    });
});

router.get('/current-track', async (req, res) => {
    var currentTrack = await spotifyApi.getMyCurrentPlayingTrack();
    let fromSpotify = Track.fromSpotify(currentTrack.body.item);
    res.json({trackName: fromSpotify.toString()});
});

router.get('/play-track', async (req, res) => {
    await spotifyApi.play({
        context_uri: 'spotify:user:' + req.query.context.userId + ':playlist:' + req.query.context.playlistId,
        offset: {uri: 'spotify:track:' + req.query.trackId } 
    });
    res.json();
});

function showError(res, message, error) {
    error = message + ": " + error;
    res.status(500).json({ error: error});
};

export default router;