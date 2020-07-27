import SpotifyWebApi = require('spotify-web-api-node')
import { Track } from './track'
import { Playlist } from './Playlist'

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'user-modify-playback-state',
]
const clientId = '3a2c92864fe34fdfb674580a0901568e'
const state = 'some-state-of-my-choice'

const playlistLimit = 100

export class SpotifyApi {
  public api: SpotifyWebApi

  constructor(host: string, tokens?: any) {
    this.api = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: 'c09a0bdffa7d452ca4fbe14c53d32f94',
      redirectUri: host + '/authorized',
    })
    tokens = tokens || {}
    this.api.setAccessToken(tokens.accessToken)
    this.api.setRefreshToken(tokens.refreshToken)
  }

  playlistToText(playlist: Track[]) {
    var textualPlaylist = ''
    for (let track of playlist) {
      textualPlaylist += track.toString() + '\n'
    }
    return textualPlaylist
  }

  async getTextualPlaylist(userId: string, playlistId: string) {
    var playlist = await this.getPlaylist(null, userId, playlistId)
    return this.playlistToText(playlist.items)
  }

  getDownloadedLyrics(playlist: Track[], downloaded: boolean = false) {
    var filtered = playlist.filter((track) =>
      downloaded ? track.lyrics == null : track.lyrics != null
    )
    return this.playlistToText(filtered)
  }

  async getPlaylist(
    playlist: Playlist,
    userId: string,
    playlistId: string,
    offset: number = 0
  ): Promise<Playlist> {
    var data
    if (playlist == null) {
      data = await this.api.getPlaylist(userId, playlistId)
      playlist = Playlist.createFromPlaylist(userId, playlistId, data.body)
    } else {
      data = await this.api.getPlaylistTracks(userId, playlistId, {
        offset: offset,
        limit: playlistLimit,
        fields: 'items',
      })
      playlist.addTracks(data.body.items)
    }
    return playlist
  }

  async getAlbum(albumId: string): Promise<Playlist> {
    var data = await this.api.getAlbum(albumId)
    return Playlist.createFromAlbum(albumId, data.body)
  }

  getAuthorizeUrl() {
    // credentials are optional
    let authorizeUrl = this.api.createAuthorizeURL(scopes, state)
    console.log('Autorize url: ' + authorizeUrl)
    return authorizeUrl
  }

  getToken(code) {
    console.log('Code is: ' + code)
    return this.api
      .authorizationCodeGrant(code)
      .then((data) => {
        // Set the access token on the API object to use it in later calls
        console.log('Token is: ' + data.body['access_token'])
        this.api.setAccessToken(data.body['access_token'])
        this.api.setRefreshToken(data.body['refresh_token'])
        var expireInterval = data.body['expires_in']
        console.log(
          'Refreshed token. It now expires in ' + expireInterval + ' seconds!'
        )

        return data
      })
      .catch((ex) => {
        console.log('Spotify: something went wrong setting token!\n', ex)
      })
  }

  refreshAccessToken() {
    let api = this.api
    return api.refreshAccessToken().then(
      (data) => {
        console.log('The access token has been refreshed!')

        // Save the access token so that it's used in future calls
        api.setAccessToken(data.body['access_token'])

        return data
      },
      (err) => {
        console.log('Could not refresh access token', err)
      }
    )
  }

  async getCurrentlyPlaying() {
    var currentTrack = await this.api.getMyCurrentPlayingTrack()
    var context = currentTrack.body.context
    var tokens
    if (!context) return Playlist.Empty()
    if (context.type === 'album') {
      tokens = context.uri.split(':')
      var albumId = tokens[2]
      return await this.getAlbum(albumId)
    } else if (context.type === 'playlist') {
      tokens = context.uri.split(':')
      let userId = tokens[2]
      let playlistId = tokens[4]
      return await this.getPlaylist(null, userId, playlistId)
    }
    return Playlist.Empty()
  }

  async doAsyncApiCall(func): Promise<any> {
    try {
      return await func(this.api)
    } catch (err) {
      console.log(
        'Error executing async Spotify API call ' + func.name + ': ',
        err.message
      )
    }
    return new Promise((resolve) => resolve())
  }

  doApiCall(func): any {
    try {
      return func(this.api)
    } catch (err) {
      console.log(
        'Error executing Spotify API call ' + func.name + ': ',
        err.message
      )
    }
    return null
  }
}
