import assert = require('assert');
import {Playlist} from "./Playlist"

describe("Spotify API", async () => {
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
});
