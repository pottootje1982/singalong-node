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
                "Beatles -Yellow Submarine");
            assert.equal(playlist.items.length, 2);
            assert.equal('1793 George Harrison', playlist[0].artist);
            assert.equal("Give me Love", playlist[0].title);
            assert.equal('Beatles', playlist[1].artist);
            assert.equal("Yellow Submarine", playlist[1].title);
        });
});
