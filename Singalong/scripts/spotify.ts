import SpotifyWebApi = require('spotify-web-api-node');

var scopes = ['user-read-private', 'user-read-email'],
    clientId = '3a2c92864fe34fdfb674580a0901568e',
    state = 'some-state-of-my-choice';

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
    redirectUri: 'http://localhost:1337/authorized'
});

export function getTextualPlaylist(userId: any, playlistId: any);
export function getTextualPlaylist(userId, playlistId) {
    return spotifyApi.getPlaylistTracks(userId, playlistId, { 'offset': 1, 'limit': 100, 'fields': 'items' })
        .then(data => {
            var playlist = '';
            for (let item of data.body.items) {
                playlist += item.track.artists[0].name + " - " + item.track.name + '\n';
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