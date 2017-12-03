import SpotifyWebApi = require('spotify-web-api-node');
import { Track } from '../scripts/Track';

var scopes = ['user-read-private', 'user-read-email'],
    clientId = '3a2c92864fe34fdfb674580a0901568e',
    state = 'some-state-of-my-choice';

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
    redirectUri: 'http://localhost:1337/authorized'
});

export async function getTextualPlaylist(userId: string, playlistId: string) {
    var playlist = await getPlaylist(userId, playlistId);
    var textualPlaylist = '';
    for (let track of playlist) {
        textualPlaylist += track.toString() + '\n';
    }
    return textualPlaylist;
}

export function getPlaylist(userId: string, playlistId: string) : Track[] {
    return spotifyApi.getPlaylistTracks(userId, playlistId, { 'offset': 1, 'limit': 100, 'fields': 'items' })
        .then(data => {
            var playlist = [];
            for (let item of data.body.items) {
                playlist.push(new Track(item.track.artists[0].name, item.track.name));
            }
            return playlist;
        });
}

export function getAuthorizeUrl() {
    return spotifyApi.createAuthorizeURL(scopes, state);
}

export function setToken(code: any);
export function setToken(code) {
    console.log("Code is: " + code);
    return spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            // Set the access token on the API object to use it in later calls
            console.log("Token is: " + data.body['access_token']);
            spotifyApi.setAccessToken(data.body['access_token']);
        }, err => {
            console.log('Something went wrong!', err);
        });
}

export { spotifyApi };