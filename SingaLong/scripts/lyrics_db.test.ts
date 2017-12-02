var lyrics_db = require('./lyrics_db');
var assert = require('assert');
import download = require('./download');

describe("Lyrics DB", () => {
    this.timeoutTimer = "25000";
    var engine = download.engines["MusixMatch"];

    it("Get Beatles lyrics", done => {
        lyrics_db.query('The Beatles', 'Yellow Submarine').then(track => {
            assert(track.Lyrics.indexOf('In the town where I was born') >= 0);
            done();
        });
    });

    it("Get unexisting lyrics", done => {
        lyrics_db.query('Freddy Kruger', 'Nightmare on Elm Street').then(track => {
            assert.equal(track, null);
            done();
        });
    });

    it("Store John Lennon lyrics",
        async function (done) {
            let artist = 'John Lennon';
            let title = 'Imagine';
            var lyrics = await engine.searchLyrics(artist, title);
            var res, error = await lyrics_db.insert(artist, title, engine.name, lyrics);
            assert.equal(error, "ER_DUP_ENTRY: Duplicate entry 'John Lennon-Imagine' for key 'PRIMARY'");
            done();
        });
});
