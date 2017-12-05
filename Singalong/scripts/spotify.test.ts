import Spotify = require("./spotify");
var spotifyApi = Spotify.getApi('localhost:1337');
var assert = require('assert');

var code =
    'AQD_FGHa3YKf1PKva5_360xmaeXaLgdPpVuHa6M0HKs0Ucccxb7tZFCBxKWOy_AbH1KPn28VmSsc2gcvODiyFNDFKpVd6emngMEmBSq46JoVAxgMz7EeM7m1QhmrdEVz15pJHGufCfX6W5L-4X9jvGDABww-hQG66cwr01Afa4RzGNSkL-tqS6x_tjVQbq1g_a7IHYLkcr1iLsjVjtI44XSeFwv7eWZtwxtjZi3XmrEH_Op36QXIyb86';
var token =
    'BQCzfTulxd46cHvFDae3Qpwbv7TNdJSb3skgTk5FcdBe7pHZWCIm5OvNWwXuVdU7yvVWAMFJMkNVfOfbie_DBBKoY1HfNEotgMVx2mB41tx-sNwcxCeBivZOzTdaFUDVA9ygTjr4u6UUezRa8uN6OHqFX48vge07';
spotifyApi.setAccessToken(token);

describe("Spotify API", async() => {
    it("Get me", async() => {
        var data = await spotifyApi.getMe();
        console.log('Some information about the authenticated user', data.body);
    });
    
    it("Get playlists", async() => {
        var data = await spotifyApi.getUserPlaylists();
        console.log('Retrieved playlists', data.body);
    });

    it("Get full playlist", async function() {
        this.timeout(25000);
        var user = await spotifyApi.getMe();
        var tracks = await Spotify.getFullPlaylist(user.body.id, '6jaK2iM45Myomj4GJqCi4v'); // Top 2000
        console.log(tracks);
        assert(tracks.length > 100);
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
