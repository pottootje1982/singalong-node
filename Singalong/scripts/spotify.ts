import SpotifyWebApi = require('spotify-web-api-node');
import { Track } from '../scripts/Track';

var scopes = ['user-read-private', 'user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'user-modify-playback-state'],
    clientId = '3a2c92864fe34fdfb674580a0901568e',
    state = 'some-state-of-my-choice';

var spotifyApi;
const playlistLimit = 100;

export function playlistToText(playlist: Track[]) {
    var textualPlaylist = '';
    for (let track of playlist) {
        textualPlaylist += track.toString() + '\n';
    }
    return textualPlaylist;
}

export async function getTextualPlaylist(userId: string, playlistId: string) {
    var playlist = await getFullPlaylist(userId, playlistId);
    return playlistToText(playlist);
}

export function getDownloadedLyrics(playlist: Track[], downloaded: boolean = false) {
    var filtered = playlist.filter(track => downloaded ? track.lyrics == null : track.lyrics != null);
    return playlistToText(filtered);
}

export async function getFullPlaylist(userId: string, playlistId: string): Promise<Track[]> {
    var count = 0;
    var playlist = [];
    var data = await spotifyApi.getPlaylist(userId, playlistId);
    count += addToPlaylist(data.body.tracks.items, playlist);
    var total = data.body.tracks.total;
    while (total > count || data.body.items === 0) {
        data = await spotifyApi.getPlaylistTracks(userId,
            playlistId,
            { offset: playlist.length, 'limit': playlistLimit, 'fields': 'items' });
        count += addToPlaylist(data.body.items, playlist);
    }
    return playlist;
}

function addToPlaylist(items, playlist: Track[]): number {
    for (let item of items) {
        var track = Track.fromSpotify(item.track);
        if (track == null) continue;
        playlist.push(track);
    }
    return items.length;
}

export function getAuthorizeUrl() {
    // credentials are optional
    let authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
    console.log('Autorize url: ' + authorizeUrl);
    return authorizeUrl;
}

export function setToken(code) {
    console.log("Code is: " + code);
    return spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            // Set the access token on the API object to use it in later calls
            console.log("Token is: " + data.body['access_token']);
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            var expireInterval = data.body['expires_in'];
            console.log('Refreshed token. It now expires in ' + expireInterval + ' seconds!');

            setInterval(function () {
                console.log('Refreshed token. It now expires in ' + expireInterval + ' seconds!');
                clearInterval(this);
                // Refresh token
                spotifyApi.refreshAccessToken().then(data => {
                    this.spotifyApi.setAccessToken(data.body['access_token']);
                });
            }, expireInterval * 1000);

        }, err => {
            console.log('Something went wrong!', err);
        });
}

export function getApi(host: string) {
    if (spotifyApi == null) {
        spotifyApi = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
            redirectUri: 'http://' + host + '/authorized'
        });
    }
    return spotifyApi;
}