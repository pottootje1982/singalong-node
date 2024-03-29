﻿import SpotifyWebApi = require('spotify-web-api-node')
import { createTrack } from '../client/src/track'
const fs = require('fs')
const { get, post, put } = require('axios')
const qs = require('qs')
const config = require('../config')

const scopes = [
  'user-read-email',
  'user-read-private',
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'user-modify-playback-state',
  'playlist-modify-public',
  'playlist-modify-private',
  'streaming',
]
const state = 'some-state-of-my-choice'
const base = 'https://api.spotify.com/v1'

export const limit = 100

export function createTracks(tracks, hasMore = false) {
  tracks = tracks.map(createTrack)
  return { tracks, hasMore }
}

export class SpotifyApi {
  public api: SpotifyWebApi
  private headers: any
  private tokens: { accessToken?: string; refreshToken?: string }

  constructor(
    host: string,
    tokens?: { accessToken?: string; refreshToken?: string }
  ) {
    host = host || config.endpoint
    this.api = new SpotifyWebApi({
      clientId: config.spotifyKey,
      clientSecret: config.spotifySecret,
      redirectUri: host + '/authorized',
    })
    tokens = tokens || {}
    this.headers = {
      Authorization: `Bearer ${tokens.accessToken}`,
    }
    this.api.setAccessToken(tokens.accessToken)
    this.api.setRefreshToken(tokens.refreshToken)
    this.tokens = tokens
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

        return data.body
      })
      .catch((ex) => {
        console.log('Spotify: something went wrong setting token!\n', ex)
      })
  }

  reformatUri(uri: string) {
    return (
      uri &&
      uri.replace(/spotify:user:\d+/, 'spotify').replace('spotify:user:', '')
    )
  }

  get(uri, params?) {
    return get(uri, {
      headers: this.headers,
      params,
    }).then((res) => res.data)
  }

  post(uri, body) {
    return post(uri, body, {
      headers: this.headers,
    })
  }

  put(uri, body) {
    return put(uri, body, {
      headers: this.headers,
    })
  }

  getPlaylist(id, params) {
    params = { limit, ...params }
    return this.get(
      `${base}/playlists/${id}/tracks?fields=items(track(id,name,artists(name),duration_ms,uri)),next`,
      params
    )
  }

  async getPlaylistFromUri(uri: string, options: any) {
    uri = this.reformatUri(uri)
    const [, type, id] = uri.split(':')
    switch (type) {
      case 'artist':
        const artistTracks = await this.api.getArtistTopTracks(id, 'NL')
        return createTracks(artistTracks.body.tracks)
      case 'album':
        const albumTracks = await this.api.getAlbum(id)
        return createTracks(albumTracks.body.tracks.items)
      case 'playlist':
        const { items, next } = await this.getPlaylist(id, options)
        return createTracks(
          items.map((i) => i.track).filter((t) => t),
          !!next
        )
      case 'track':
        const track = await this.api.getTrack(id)
        return createTracks([track.body])
      default:
        break
    }
  }

  refresh() {
    return post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_KEY}:${process.env.SPOTIFY_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
  }

  async getUserPlaylists(options: {
    limit: number
    offset: number
  }): Promise<{ playlists: any; hasMore: boolean }> {
    const { items: playlists, next: hasMore } = await this.get(
      `${base}/me/playlists`,
      options
    )
    return { playlists, hasMore }
  }

  async owner() {
    const { body } = await this.api.getMe()
    const { id: owner } = body || {}
    return owner
  }
}

let cachedFileToken

function getTokens(req) {
  let { accesstoken: accessToken, refreshtoken: refreshToken } = req.headers
  if (!accessToken && !process.env.NODE_ENV) {
    cachedFileToken = accessToken =
      cachedFileToken ||
      fs.readFileSync('./token.txt', { encoding: 'utf8', flag: 'r' })
  }
  return { accessToken, refreshToken }
}

export function saveToken(token) {
  cachedFileToken = token
  fs.writeFileSync('./token.txt', token)
}

export function createApi(req): SpotifyApi {
  return new SpotifyApi(`http://${req.headers.host}`, getTokens(req))
}
