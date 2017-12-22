import SpotifyWebApi = require('spotify-web-api-node');
import { Track } from './Track';
import { Playlist } from './Playlist';

var scopes = ['user-read-private', 'user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'user-modify-playback-state'],
    clientId = '3a2c92864fe34fdfb674580a0901568e',
    state = 'some-state-of-my-choice';

const playlistLimit = 100;

export class SpotifyApi {
    private spotifyApi: SpotifyWebApi;

    constructor(host: string, tokens: any) {
        this.spotifyApi = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
            redirectUri: 'http://' + host + '/authorized'
        });
        this.spotifyApi.setAccessToken(tokens.accessToken);
        this.spotifyApi.setRefreshToken(tokens.refreshToken);
    }

    playlistToText(playlist: Track[]) {
        var textualPlaylist = '';
        for (let track of playlist) {
            textualPlaylist += track.toString() + '\n';
        }
        return textualPlaylist;
    }

    async getTextualPlaylist(userId: string, playlistId: string) {
        var playlist = await this.getFullPlaylist(userId, playlistId);
        return this.playlistToText(playlist.items);
    }

    getDownloadedLyrics(playlist: Track[], downloaded: boolean = false) {
        var filtered = playlist.filter(track => downloaded ? track.lyrics == null : track.lyrics != null);
        return this.playlistToText(filtered);
    }

    async getFullPlaylist(userId: string, playlistId: string): Promise<Playlist> {
        var count = 0;
        var playlist = [];
        var data = await this.spotifyApi.getPlaylist(userId, playlistId);
        count += this.addToPlaylist(data.body.tracks.items, playlist);
        var total = data.body.tracks.total;
        while (total > count || data.body.items === 0) {
            data = await this.spotifyApi.getPlaylistTracks(userId,
                playlistId,
                { offset: playlist.length, 'limit': playlistLimit, 'fields': 'items' });
            count += this.addToPlaylist(data.body.items, playlist);
        }
        return new Playlist(userId, playlistId, null, data.body.name, playlist);
    }

    async getAlbum(albumId: string): Promise<Playlist> {
        var playlist = [];
        var data = await this.spotifyApi.getAlbum(albumId);
        this.addToPlaylist(data.body.tracks.items, playlist);
        return new Playlist(null, null, albumId, data.body.name, playlist);
    }

    addToPlaylist(items, playlist: Track[]): number {
        for (let item of items) {
            var track = Track.fromSpotify(item.track || item);
            if (track == null) continue;
            playlist.push(track);
        }
        return items.length;
    }

    getAuthorizeUrl() {
        // credentials are optional
        let authorizeUrl = this.spotifyApi.createAuthorizeURL(scopes, state);
        console.log('Autorize url: ' + authorizeUrl);
        return authorizeUrl;
    }

    setToken(code) {
        console.log("Code is: " + code);
        return this.spotifyApi.authorizationCodeGrant(code)
            .then(data => {
                // Set the access token on the API object to use it in later calls
                console.log("Token is: " + data.body['access_token']);
                this.spotifyApi.setAccessToken(data.body['access_token']);
                this.spotifyApi.setRefreshToken(data.body['refresh_token']);
                var expireInterval = data.body['expires_in'];
                console.log('Refreshed token. It now expires in ' + expireInterval + ' seconds!');

                var api = this.spotifyApi;
                setInterval(function () {
                    console.log('Refreshed token. It now expires in ' + expireInterval + ' seconds!');
                    clearInterval(this);
                    // Refresh token
                    api.refreshAccessToken().then(data => {
                        api.setAccessToken(data.body['access_token']);
                    });
                }, expireInterval * 1000);

                return data;
            }, err => {
                console.log('Spotify: something went wrong setting token!', err);
            });
    }

    async getCurrentlyPlaying() {
        var currentTrack = await this.spotifyApi.getMyCurrentPlayingTrack();
        var context = currentTrack.body.context;
        var tokens;
        if (!context) return null;
        if (context.type === 'album') {
            tokens = context.uri.split(':');
            var albumId = tokens[2];
            return await this.getAlbum(albumId);
        }
        else if (context.type === 'playlist') {
            tokens = context.uri.split(':');
            let userId = tokens[2];
            let playlistId = tokens[4];
            return await this.getFullPlaylist(userId, playlistId);
        }
        return null;
    }

    async doAsyncApiCall(func) : Promise<any> {
        try {
            return await func(this.spotifyApi);
        } catch (err) {
            console.log("Error executing async Spotify API call " + func.name + ": ", err.message);
        }
        return new Promise(resolve=>resolve());
    }

    doApiCall(func) : any {
        try {
            return func(this.spotifyApi);
        } catch (err) {
            console.log("Error executing Spotify API call " + func.name + ": ", err.message);
        }
        return null;
    }

}

