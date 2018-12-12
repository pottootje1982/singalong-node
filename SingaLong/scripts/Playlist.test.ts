import assert = require('assert');
import {Playlist} from "./Playlist"

var playlist = Playlist.textualPlaylistToPlaylist('1793 George Harrison - Give me Love\n' +
"Beatles - Yellow Submarine\n" +
"Rodríguez - I Wonder\n" +
"Rodríguez - Crucify Your Mind\n" + 
"S.I. Istwa - The Angry River - From The HBO Series True Detective\n" +
'Bonnie "Prince" Billy - Intentional Injury - From The HBO Series True Detective\n' + 
"Lykke Li - Time In A Bottle");

describe("Playlist", async () => {
    it("Empty Textual playlist to tracks",
        () => {
            var playlist = Playlist.textualPlaylistToPlaylist('');
            assert.equal(playlist.items.length, 0);
        });

        it("Textual playlist to tracks",
        () => {
            var playlist = Playlist.textualPlaylistToPlaylist('1793 George Harrison - Give me Love\n' +
                "Beatles - Yellow Submarine");
            let items = playlist.items;
            assert.equal(items.length, 2);
            assert.equal('1793 George Harrison', items[0].artist);
            assert.equal("Give me Love", items[0].title);
            assert.equal('Beatles', items[1].artist);
            assert.equal("Yellow Submarine", items[1].title);
        });

        it("Get next track with lyrics",
        () => {
            let items = playlist.items;
            assert.equal(items.length, 7);
            let i = 0;
            items.forEach(element => {
                element.id = (i++).toString();
            });
            items[0].lyrics = "lyrics1";
            items[3].lyrics = "lyrics2";
            items[5].lyrics = "lyrics3";
            var next = playlist.getNextTrackWithLyrics('2', true);
            assert.equal('3', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, true);
            assert.equal('5', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, true);
            assert.equal('0', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, true);
            assert.equal('3', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, false);
            assert.equal('0', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, false);
            assert.equal('5', next.id);
            var next = playlist.getNextTrackWithLyrics(next.id, false);
            assert.equal('3', next.id);
        });

        it("Get next track",
        () => {
            let items = playlist.items;
            let i = 0;
            items.forEach(element => {
                element.id = (i++).toString();
            });
            var next = playlist.getNextTrack('5', true);
            assert.equal('6', next.id);
            var next = playlist.getNextTrack(next.id, true);
            assert.equal('0', next.id);
            var next = playlist.getNextTrack(next.id, false);
            assert.equal('6', next.id);
        });
});
