var lyrics_db = require('./lyrics_db');
var assert = require('assert');
import download = require('./download');
import {Track} from './Track';

describe("Lyrics DB", () => {
    this.timeoutTimer = "25000";
    var engine = download.engines["MusixMatch"];

    it("Get Beatles lyrics", done => {
        lyrics_db.query('The Beatles', 'Yellow Submarine').then(tracks => {
            assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0);
            done();
        });
    });

    it("Get Beatles lyrics", done => {
        lyrics_db.query(null, 'Yellow Submarine').then(tracks => {
            assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0);
            done();
        });
    });

    it("Get Double lyrics", async(done) => {
        var track = await lyrics_db.queryTrack(new Track('Nils Landgren', 'Christmas Song'));
        assert(track.lyrics.indexOf('Chestnuts roasting on an open fire') >= 0);
        done();
    });


    it("Get lyrics for title track", done => {
        lyrics_db.queryTrack(new Track('', 'Es ist ein Ros entsprungen')).then(track => {
            assert(track.lyrics.indexOf("Es ist ein Ros' entsprungen") >= 0);
            done();
        });
    });

    it("Get unexisting lyrics", done => {
        lyrics_db.query('Freddy Kruger', 'Nightmare on Elm Street').then(tracks => {
            assert.equal(tracks, null);
            done();
        });
    });

    it("Store John Lennon lyrics",
        async function (done) {
            let track = new Track('John Lennon', 'Imagine');
            var lyrics = await engine.searchLyrics(track.artist, track.title);
            var res, error = await lyrics_db.insert(track, engine.name, lyrics);
            assert.equal(error, "ER_DUP_ENTRY: Duplicate entry 'John Lennon-Imagine' for key 'PRIMARY'");
            done();
        });
});
