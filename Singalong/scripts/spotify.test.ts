import Spotify = require("./spotify");
var spotifyApi = Spotify.spotifyApi;
var code = Spotify.code;

describe("Spotify API", () => {
    this.timeoutTimer = "25000";

    /*
    it("Get code", () => {
        var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
         https://accounts.spotify.com:443/authorize?client_id=3a2c92864fe34fdfb674580a0901568e&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
        console.log(authorizeURL);
    });
    */

    //*
    it("Get token", done => {
        spotifyApi.authorizationCodeGrant(code)
            .then(function (data) {
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                done();
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });
    //*/

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
