var SpotifyWebApi = require('spotify-web-api-node');
import assert = require('assert');

var scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'https://example.com/callback',
    clientId = '3a2c92864fe34fdfb674580a0901568e',
    state = 'some-state-of-my-choice';

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
    redirectUri: redirectUri
});

// The code that's returned as a query parameter to the redirect URI
var code = 'AQCCLptXJXgfPbT7VtpEcyRTiSUY3a277P8ic8cGc4VStbOecYL5oWtCqOAda7_4OZYQ--e3kkpu8Ihnk6CUqCmX4ltLN0wiZZMHUoEkhGRH6_ZyBAxtg2oo55ZtPkRmClRFUR3fIb5X2lqTrZEAdWlW56ypev4rwl6edCK6ZcSC2Z_fARs37XvUO9YcSj6zAhk0wLSbVrPcX-RJcIQ-dpLqXuz-WDz-qVZ3Lj49lAt6lABdgBM';
var token =
    'BQA6jSix02WPbDnGycHVt07WkBVoRM-m61P5n452wfARfBajPM0w_mSvtxA9kwkRhbSRVDb7WnAlayUjkCQI5iheSNnYptZmgvdPinz8yfSjdj3UDoRCGS1DiawTLjHWv8HUT6sdjcJFiC-WWW7Z9mVC8bsPiH3N';
var refreshToken =
    'AQCbba8AdxFSNWbdFP-Cc7O5uh1nlhm2WHnVaGsrerkB2h5DZ5mi9yXnBlZDuE-1CWVXVBvzrL0XJBjNOSA13HsgXNCf-EUznWWSXCJTXH7FDbV-GM-h9dYE9cgyWgF9Nxw';
spotifyApi.setAccessToken(token);
//spotifyApi.setRefreshToken(refreshToken);

export function getTextualPlaylist(userId, playlistId) {
    return spotifyApi.getPlaylistTracks(userId, playlistId, { 'offset': 1, 'limit': 100, 'fields': 'items' })
        .then(function (data) {
            var playlist = '';
            for (let item of data.body.items) {
                playlist += item.track.artists[0].name + " - " + item.track.name + '\n';
            }
            return playlist;
        });
}

export { spotifyApi, code };