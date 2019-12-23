import { SpotifyApi } from "./spotify";
import {Playlist} from "./Playlist"
var assert = require('assert');

var refreshToken =
    'AQAGNwDVuUsQDUaiSCDpkjTyRczEr5ekeKZ_0CFigXNQUEswWvjxPt_VIwv8mRM1Df64GUHK8RwfUk2Zmhpd1cN3_8xDVABqqtl90FEZ1jZUykPKiH2y-Izpust2fZMqXT4';
var spotifyApi = new SpotifyApi('localhost:1337', { refreshToken: refreshToken });

describe("Spotify API", async () => {
    before(async () => {
        await spotifyApi.refreshAccessToken();
    });

    it("Get playlists", async() => {
        var data = await spotifyApi.doAsyncApiCall(api => api.getUserPlaylists());
        console.log('Retrieved playlists', data.body);
    });

    it("Get full playlist", async function() {
        this.timeout(25000);
        var user = await spotifyApi.api.getMe();
        var playlist = await spotifyApi.getPlaylist(null, user.body.id, '3LWmcclCz2usTAVDBjDdi4'); // Top 2000
        console.log(playlist.items);
        assert.equal(playlist.items.length, 100);
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

    it("Get Album", () => {
        var playlist = new Playlist()
        playlist.addTracks(album.body.tracks.items);
        assert.equal(9, playlist.items.length);
        assert.equal("Dire Straits", playlist.items[0].artist);
        assert.equal("So Far Away - Full Version", playlist.items[0].title);
    });


    var album = {
        "body":
        {
            "album_type": "album",
            "artists":
            [
                {
                    "external_urls": { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                    "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                    "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                    "name": "Dire Straits",
                    "type": "artist",
                    "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                }
            ],
            "available_markets":
            [
                "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK",
                "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IL", "IS", "IT",
                "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL",
                "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR", "TW", "US", "UY", "VN", "ZA"
            ],
            "copyrights":
            [
                { "text": "© 1985 Mercury Records Limited", "type": "C" },
                { "text": "℗ 1985 Mercury Records Limited", "type": "P" }
            ],
            "external_ids": { "upc": "00042282449924" },
            "external_urls": { "spotify": "https://open.spotify.com/album/1NF8WUbdC632SIwixiWrLh" },
            "genres": [],
            "href": "https://api.spotify.com/v1/albums/1NF8WUbdC632SIwixiWrLh",
            "id": "1NF8WUbdC632SIwixiWrLh",
            "images":
            [
                {
                    "height": 634,
                    "url": "https://i.scdn.co/image/ee6d0d264005b0549be5fa76d0cf6e57d0a542ce",
                    "width": 640
                },
                {
                    "height": 297,
                    "url": "https://i.scdn.co/image/78ace3900b14d836c3d45603872dd63300cb89f5",
                    "width": 300
                },
                { "height": 63, "url": "https://i.scdn.co/image/83c7a03dbd942196f4d80a5e976294fba66c8356", "width": 64 }
            ],
            "label": "Universal Music Group",
            "name": "Brothers In Arms (Remastered)",
            "popularity": 73,
            "release_date": "1985-05-13",
            "release_date_precision": "day",
            "tracks": {
                "href": "https://api.spotify.com/v1/albums/1NF8WUbdC632SIwixiWrLh/tracks?offset=0&limit=50",
                "items": [
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 308800,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/0h8pmQEibj5GUdMoaqrJnF" },
                        "href": "https://api.spotify.com/v1/tracks/0h8pmQEibj5GUdMoaqrJnF",
                        "id": "0h8pmQEibj5GUdMoaqrJnF",
                        "is_local": false,
                        "name": "So Far Away - Full Version",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/7ca237833b7eb9b14b9795afcaa723ba4b0c84fa?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 1,
                        "type": "track",
                        "uri": "spotify:track:0h8pmQEibj5GUdMoaqrJnF"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 510933,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/4WfGrAJVC3A5xhUTja0gUG" },
                        "href": "https://api.spotify.com/v1/tracks/4WfGrAJVC3A5xhUTja0gUG",
                        "id": "4WfGrAJVC3A5xhUTja0gUG",
                        "is_local": false,
                        "name": "Money For Nothing",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/280d447a61ab0ad2b6c201a3c75bc1af6ba17d0a?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 2,
                        "type": "track",
                        "uri": "spotify:track:4WfGrAJVC3A5xhUTja0gUG"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 249960,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/4tyl9OMKMG8F2L0RUYQMH3" },
                        "href": "https://api.spotify.com/v1/tracks/4tyl9OMKMG8F2L0RUYQMH3",
                        "id": "4tyl9OMKMG8F2L0RUYQMH3",
                        "is_local": false,
                        "name": "Walk Of Life",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/ba282503560ba80d5e132f9d8fe89a3aa759c9b7?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 3,
                        "type": "track",
                        "uri": "spotify:track:4tyl9OMKMG8F2L0RUYQMH3"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 393266,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/6rg61PBHTfEDvgNt7MNhyU" },
                        "href": "https://api.spotify.com/v1/tracks/6rg61PBHTfEDvgNt7MNhyU",
                        "id": "6rg61PBHTfEDvgNt7MNhyU",
                        "is_local": false,
                        "name": "Your Latest Trick",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/276515b69271b20e4f75398e2f77fce541429fcf?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 4,
                        "type": "track",
                        "uri": "spotify:track:6rg61PBHTfEDvgNt7MNhyU"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 509066,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/0NL5lqKSd0obXvKwfvyTKw" },
                        "href": "https://api.spotify.com/v1/tracks/0NL5lqKSd0obXvKwfvyTKw",
                        "id": "0NL5lqKSd0obXvKwfvyTKw",
                        "is_local": false,
                        "name": "Why Worry?",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/69db34a384f706696b588e153a77140002721fc9?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 5,
                        "type": "track",
                        "uri": "spotify:track:0NL5lqKSd0obXvKwfvyTKw"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 424600,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/232usfwnBVq3HPkhBxKFcT" },
                        "href": "https://api.spotify.com/v1/tracks/232usfwnBVq3HPkhBxKFcT",
                        "id": "232usfwnBVq3HPkhBxKFcT",
                        "is_local": false,
                        "name": "Ride Across The River",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/1f843396f311022ede113c85bb72ed2156efdb98?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 6,
                        "type": "track",
                        "uri": "spotify:track:232usfwnBVq3HPkhBxKFcT"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 275481,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/5UvLMW2qdHge1P9AkkDXfa" },
                        "href": "https://api.spotify.com/v1/tracks/5UvLMW2qdHge1P9AkkDXfa",
                        "id": "5UvLMW2qdHge1P9AkkDXfa",
                        "is_local": false,
                        "name": "The Man's Too Strong",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/854f97c2d66d80e89fb10e174b83c6ce8a862cef?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 7,
                        "type": "track",
                        "uri": "spotify:track:5UvLMW2qdHge1P9AkkDXfa"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 218466,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/1W3kfKYF1BimzHj1Q20hAF" },
                        "href": "https://api.spotify.com/v1/tracks/1W3kfKYF1BimzHj1Q20hAF",
                        "id": "1W3kfKYF1BimzHj1Q20hAF",
                        "is_local": false,
                        "name": "One World",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/13399c394222d76736b74ced6c890d7ab8fd068c?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 8,
                        "type": "track",
                        "uri": "spotify:track:1W3kfKYF1BimzHj1Q20hAF"
                    },
                    {
                        "artists":
                        [
                            {
                                "external_urls":
                                    { "spotify": "https://open.spotify.com/artist/0WwSkZ7LtFUFjGjMZBMt6T" },
                                "href": "https://api.spotify.com/v1/artists/0WwSkZ7LtFUFjGjMZBMt6T",
                                "id": "0WwSkZ7LtFUFjGjMZBMt6T",
                                "name": "Dire Straits",
                                "type": "artist",
                                "uri": "spotify:artist:0WwSkZ7LtFUFjGjMZBMt6T"
                            }
                        ],
                        "available_markets":
                        [
                            "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ",
                            "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID",
                            "IE", "IL", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MX", "MY", "NI", "NL",
                            "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "SE", "SG", "SK", "SV", "TH", "TR",
                            "TW", "US", "UY", "VN", "ZA"
                        ],
                        "disc_number": 1,
                        "duration_ms": 424000,
                        "explicit": false,
                        "external_urls": { "spotify": "https://open.spotify.com/track/7EmSPZ9f1AiLR9eVHNSI62" },
                        "href": "https://api.spotify.com/v1/tracks/7EmSPZ9f1AiLR9eVHNSI62",
                        "id": "7EmSPZ9f1AiLR9eVHNSI62",
                        "is_local": false,
                        "name": "Brothers In Arms",
                        "preview_url":
                            "https://p.scdn.co/mp3-preview/998b46a59dff58b5b875009658b52ddb42a2459c?cid=3a2c92864fe34fdfb674580a0901568e",
                        "track_number": 9,
                        "type": "track",
                        "uri": "spotify:track:7EmSPZ9f1AiLR9eVHNSI62"
                    }
                ],
                "limit": 50,
                "next": null,
                "offset": 0,
                "previous": null,
                "total": 9
            },
            "type": "album",
            "uri": "spotify:album:1NF8WUbdC632SIwixiWrLh"
        },
        "headers": {
            "server": "nginx",
            "date": "Mon, 09 Apr 2018 20:46:48 GMT",
            "content-type": "application/json; charset=utf-8",
            "content-length": "1928",
            "connection": "close",
            "cache-control": "public, max-age=7200",
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "Accept, Authorization, Origin, Content-Type, Retry-After",
            "access-control-allow-methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
            "access-control-allow-credentials": "true",
            "access-control-max-age": "604800",
            "content-encoding": "gzip",
            "x-content-type-options": "nosniff",
            "strict-transport-security": "max-age=31536000"
        },
        "statusCode": 200
    };
});
