var lyrics_db = require('./lyrics_db');
var assert = require('assert');
import download = require('./download');
import {Track} from './Track';
var fs = require('fs');

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '87.195.169.201',
        port: 3307,
        user: 'pottootje1982',
        password: 'Icf5uEiPRtjXD7GK',
        database: 'singalong'
    },
    useNullAsDefault: true
});

describe("Lyrics DB", () => {
    this.timeoutTimer = "25000";

    it("Get Beatles lyrics", async () => {
        var res = await knex('lyrics').where({
            artist: 'The Beatles',
            title: 'Yellow Submarine'
        }).orWhere('Title', 'like', '%Heroes%').select();

        var tracks = await lyrics_db.query('The Beatles', 'Yellow Submarine');
        assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0);
    });

    it("Get Beatles lyrics", async() =>
    {
        var tracks = await lyrics_db.query(null, 'Yellow Submarine');
        assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0);
    });

    it("Get Double lyrics", async() => {
        var track = await lyrics_db.queryTrack(new Track('Nils Landgren', 'Christmas Song'));
        assert(track.lyrics.indexOf('Chestnuts roasting on an open fire') >= 0);
    });


    it("Get lyrics for title track", async() => {
        var track = await lyrics_db.queryTrack(new Track('', 'Es ist ein Ros entsprungen'));
        assert(track.lyrics.indexOf("Es ist ein Ros' entsprungen") >= 0);
    });

    it("Search for empty title", async() => {
        var track = await lyrics_db.queryTrack(new Track('Beatles', ''));
        assert.equal(track, null);
    });

    it("Get unexisting lyrics", async() => {
        var tracks = await lyrics_db.query('Freddy Kruger', 'Nightmare on Elm Street');
        assert.equal(tracks, null);
    });

    it("Query unexisting playlist pushAllTracks", async () => {
        var playlist = await lyrics_db.queryPlaylist([new Track("Freddy Kruger", "Nightmare on Elm Street")]);
        assert.equal(1, playlist.length);
        assert.equal(playlist[0].artist, 'Freddy Kruger');
        assert.equal(playlist[0].title, 'Nightmare on Elm Street');
        assert.equal(playlist[0].lyrics, null);
    });

    it("Query playlist notDownloaded", async () => {
        var playlist = await lyrics_db.queryPlaylist([new Track("Freddy Kruger", "Nightmare on Elm Street"),
            new Track("John Lennon", "Imagine")], true);
        assert.equal(1, playlist.length);
        assert.equal(playlist[0].artist, 'Freddy Kruger');
        assert.equal(playlist[0].title, 'Nightmare on Elm Street');
        assert.equal(playlist[0].lyrics, null);
    });

    it("Query playlist", async() => {
        var playlist = await lyrics_db.queryPlaylist([new Track("Ray Charles", "Georgia On My Mind"),
            new Track("Cesare Valletti", "Dein Angesicht"),
            new Track("Jenny Arean & Frans Halsema", "Vluchten Kan Niet Meer"),
            new Track("Simone Kleinsma & Robert Long", "Vanmorgen Vloog Ze Nog"),
            new Track("John Lennon", "Imagine")]
        );
        // There is an entry present in DB with Artist = 'John Lennon' AND Title = 'Imagine',
        // and one with Artist = '' AND Title = 'Imagine',
        // We only want the result with the Artist field present
        assert.equal(5, playlist.length);
        assert.equal(playlist[4].artist, 'John Lennon');
        assert.equal(playlist[4].title, 'Imagine');
        assert.equal(null, playlist.find(track => track.title === '' || track.title == null));
        assert(playlist[4].lyrics.indexOf("Imagine there's no heaven") >= 0);
    });

    it("Update John Lennon lyrics",
        async function () {
            let track = new Track('', 'Imagine', 'MusixMatch');
            var lyrics = fs.readFileSync('./scripts/TestData/imagine.txt', 'utf8');
            var res, error = await lyrics_db.updateOrInsert(track, lyrics);
            assert.equal(error, null);
        });
});
