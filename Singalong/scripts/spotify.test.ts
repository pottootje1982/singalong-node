import Spotify = require("./spotify");
var spotifyApi = Spotify.spotifyApi;
spotifyApi.setAccessToken('BQACP_6f1Gh_kkV_gBe3Teg_dBbf-OCmJl7YfYYWeE-AQ7rxd_ODCWJJooRog5OrjJPHQJOujUP1g0EDSQlVaWb1FsKOkha3RnNUQuwvwOoZtKqTmUa0fgN28OTRRuOcbSazOvzfP68DA21evZLd_Pjbb_HQra1O');

describe("Spotify API", () => {
    this.timeoutTimer = "25000";

    it("Get me", done => {
        spotifyApi.getMe()
            .then(data => {
                console.log('Some information about the authenticated user', data.body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });
    
    it("Get playlists", done => {
        spotifyApi.getUserPlaylists()
            .then(data => {
                console.log('Retrieved playlists', data.body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });


    it("Search artist", done => {
        spotifyApi.getArtist('2hazSY4Ef3aB9ATXW7F5w3')
            .then(data => {
                console.log('Artist information', data.body);
                done();
            }, err => {
                console.error(err);
            });
    });
    
    it("Search playlists", done => {
        spotifyApi.searchPlaylists('beatles')
            .then(data => {
                console.log('Found playlists are', data.body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });

    it("Playlist-id to textual playlist", done => {
        Spotify.getTextualPlaylist("116230706", "48wsHmHk9JI2fMjD4ut9Kc")
            .then(body => {
                console.log('The playlist contains these tracks', body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });
});
