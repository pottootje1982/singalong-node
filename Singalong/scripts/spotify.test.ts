import { SpotifyApi } from "./spotify";
var assert = require('assert');

var code =
    'AQByRW8PlBMMZvPAqISvFAvm9dOAU5bNbkmUcZinMfdyHtsv0G7BCZa4kEM0q_iFVhNO_WzvJtAK7QtJ3RtwNUx7P2bjOqtMigEw13dbnDV9U6abwb6V11PDc71gXychwH3e_sXqW885FkKYw_0ybIkAGYy8At15CQeXzOJ_UN2hu5htpVml1tEotwFJTtyEzXtGXAPoLL3PE-LEmx-2yRBBIPacPC6WfQMG_XnuSmILZ1sj-k_3FMs-5WARp2uKaQqC3bAzn5XyShPinECdS1taJ3AK5JQCeZwTmn0B5kRCB_G90fASfGYHo8Z_ijGW22Mco1pArsVHWS0wDtihmKmQnMBIHNH-SSpcsLNBKjDN1MxFHNA2VNKJuiWuCKN_amp0lJ6ju1qI';
var refreshToken =
    'AQAGNwDVuUsQDUaiSCDpkjTyRczEr5ekeKZ_0CFigXNQUEswWvjxPt_VIwv8mRM1Df64GUHK8RwfUk2Zmhpd1cN3_8xDVABqqtl90FEZ1jZUykPKiH2y-Izpust2fZMqXT4';
var token =
    'BQCnZOo09aI3HoT3vt0iMUlq65phjV5hhzT8QFthUzi9AjXJ00WTsn-hlNhfWW_YdZ3_7efA3Iymou5yQtSN4CjEtCCGjign9xmjvNR-_oNov232o9VKnoNKAQwaTx-wSy11rk3LFmaL3ooAM8Ks7T6YvugMee3_VDVEHq8ELswmLE4Iyw';
var spotifyApi = new SpotifyApi('localhost:1337', { accessToken: token, refreshToken: refreshToken });

describe("Spotify API", async() => {
    it("Get me", async() => {
        var data = await spotifyApi.doAsyncApiCall(api => api.getMe());
        console.log('Some information about the authenticated user', data.body);
    });

    it("Refresh access token", async () => {
        await spotifyApi.refreshAccessToken();
    });

    it("Get playlists", async() => {
        var data = await spotifyApi.doAsyncApiCall(api => api.getUserPlaylists());
        console.log('Retrieved playlists', data.body);
    });

    it("Get full playlist", async function() {
        this.timeout(25000);
        var user = await spotifyApi.doAsyncApiCall(api => api.getMe());
        var playlist = await spotifyApi.getFullPlaylist(user.body.id, '6jaK2iM45Myomj4GJqCi4v'); // Top 2000
        console.log(playlist.items);
        assert(playlist.items.length > 100);
    });

    it("Search artist", done => {
        spotifyApi.doAsyncApiCall(api => api.getArtist('2hazSY4Ef3aB9ATXW7F5w3'))
            .then(data => {
                console.log('Artist information', data.body);
                done();
            }, err => {
                console.error(err);
            });
    });
    
    it("Search playlists", done => {
        spotifyApi.doAsyncApiCall(api => api.searchPlaylists('beatles'))
            .then(data => {
                console.log('Found playlists are', data.body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });

    it("Playlist-id to textual playlist", done => {
        spotifyApi.getTextualPlaylist("116230706", "48wsHmHk9JI2fMjD4ut9Kc")
            .then(body => {
                console.log('The playlist contains these tracks', body);
                done();
            }, err => {
                console.log('Something went wrong!', err);
            });
    });
});
