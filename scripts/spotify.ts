import SpotifyWebApi = require('spotify-web-api-node')
import { Track, createTrack } from './track'
import { Playlist } from './Playlist'
const fs = require('fs')
const { get } = require('axios')

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'user-modify-playback-state',
]
const state = 'some-state-of-my-choice'

export const limit = 100

function tracks(tracks, hasMore = false) {
  tracks = tracks.map(({ id, name, artists }) =>
    createTrack(artists[0] && artists[0].name, name, id)
  )
  return { tracks, hasMore }
}

export class SpotifyApi {
  public api: SpotifyWebApi
  private headers: any

  constructor(host: string, tokens?: any) {
    host = host || process.env.ENDPOINT
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_KEY,
      clientSecret: process.env.SPOTIFY_SECRET,
      redirectUri: host + '/authorized',
    })
    tokens = tokens || {}
    this.headers = {
      Authorization: `Bearer ${tokens.accessToken}`,
    }
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

  getDownloadedLyrics(playlist: Track[], downloaded: boolean = false) {
    var filtered = playlist.filter((track) =>
      downloaded ? track.lyrics == null : track.lyrics != null
    )
    return this.playlistToText(filtered)
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

  reformatUri(uri: string) {
    return (
      uri &&
      uri.replace(/spotify:user:\d+/, 'spotify').replace('spotify:user:', '')
    )
  }

  get(uri, params) {
    return get(uri, {
      headers: this.headers,
      params,
    }).then((res) => res.data)
  }

  getPlaylist(id, params) {
    params = { limit, ...params }
    return this.get(
      `https://api.spotify.com/v1/playlists/${id}/tracks?fields=items(track(id,name,artists(name))),next`,
      params
    )
  }

  async getPlaylistFromUri(uri: string, options: any) {
    uri = this.reformatUri(uri)
    const [, type, id] = uri.split(':')
    switch (type) {
      case 'artist':
        const artistTracks = await this.api.getArtistTopTracks(id, 'NL')
        return tracks(artistTracks.body.tracks)
      case 'album':
        const albumTracks = await this.api.getAlbum(id)
        return tracks(albumTracks.body.tracks.items)
      case 'playlist':
        const { items, next } = await this.getPlaylist(id, options)
        return tracks(
          items.map((i) => i.track).filter((t) => t),
          !!next
        )
      case 'track':
        const track = await this.api.getTrack(id)
        return tracks([track.body])
      default:
        break
    }
  }

  async getCurrentlyPlayingTrack() {
    const currentTrack = await this.api.getMyCurrentPlayingTrack()
    const track: any =
      currentTrack && currentTrack.body && currentTrack.body.item
        ? Track.fromSpotify(currentTrack.body.item)
        : {}
    const uri =
      (currentTrack &&
        currentTrack.body &&
        currentTrack.body.context &&
        currentTrack.body.context.uri) ||
      currentTrack.body.item.uri
    if (track) {
      track.progress_ms = currentTrack.body.progress_ms
      track.is_playing = currentTrack.body.is_playing
    }
    return { track, uri: this.reformatUri(uri) }
  }
}

let cachedFileToken

function getTokens(req) {
  const { accesstoken: headerToken } = req.headers
  let accessToken = headerToken
  if (!accessToken && !process.env.NODE_ENV) {
    cachedFileToken = accessToken =
      cachedFileToken ||
      fs.readFileSync('./token.txt', { encoding: 'utf8', flag: 'r' })
  }
  return { accessToken }
}

export function saveToken(token) {
  cachedFileToken = token
  fs.writeFileSync('./token.txt', token)
}

export function createApi(req): SpotifyApi {
  return new SpotifyApi(`http://${req.headers.host}`, getTokens(req))
}
