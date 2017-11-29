import Spotify = require("./spotify");
var spotifyApi = Spotify.spotifyApi;
spotifyApi.setToken('');

describe("Spotify API", () => {
    this.timeoutTimer = "25000";

    it("Get me", done => {
        spotifyApi.getMe()
            .then(function (data) {
                console.log('Some information about the authenticated user', data.body);
                done();
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });

    it("Get playlists", done => {
        spotifyApi.getUserPlaylists()
            .then(function (data) {
                console.log('Retrieved playlists', data.body);
                done();
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });


    it("Search artist", done => {
        spotifyApi.getArtist('2hazSY4Ef3aB9ATXW7F5w3')
            .then(function (data) {
                console.log('Artist information', data.body);
                done();
            }, function (err) {
                console.error(err);
            });
    });
    
    it("Search playlists", done => {
        spotifyApi.searchPlaylists('beatles')
            .then(function (data) {
                console.log('Found playlists are', data.body);
                done();
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });

    it("Playlist-id to textual playlist", done => {
        Spotify.getTextualPlaylist("116230706", "48wsHmHk9JI2fMjD4ut9Kc")
            .then(function (body) {
                console.log('The playlist contains these tracks', body);
                done();
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });
});
