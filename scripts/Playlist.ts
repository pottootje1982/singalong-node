import { Track } from "../scripts/track"

export class Playlist {
  userId: string
  playlistId: string
  albumId: string

  name: string
  items: Track[]

  totalCount: number
  offset: number = 0

  constructor(
    userId: string = null,
    playlistId: string = null,
    albumId: string = null,
    name: string = null,
    playlist: Track[] = [],
    totalCount: number = 0
  ) {
    this.userId = userId
    this.playlistId = playlistId
    this.albumId = albumId
    this.name = name
    this.items = playlist
    this.totalCount = totalCount
  }

  getNextTrackWithLyrics(id: string, next: boolean): any {
    var currentTrack = this.items.find(track => track.id === id)
    var index = this.items.indexOf(currentTrack)
    if (index === -1) return null
    var offset = next ? +1 : -1
    var init = next ? offset : this.items.length - 1
    var end = next ? this.items.length - 1 : offset
    var track: Track
    for (var i = init; i != end; i = i + offset) {
      var corrected = (i + this.items.length + index) % this.items.length
      track = this.items[corrected]
      if (track.lyrics != null) {
        return track
      }
    }
  }

  getNextTrack(id: string, next: boolean): any {
    var currentTrack = this.items.find(track => track.id === id)
    var index = this.items.indexOf(currentTrack)
    var offset = next ? +1 : -1
    var nextIndex = (index + this.items.length + offset) % this.items.length
    return this.items[nextIndex]
  }

  getTrack(id: string): any {
    var currentTrack = this.items.find(track => track.id === id)
    return currentTrack
  }

  getId() {
    return this.albumId || this.playlistId
  }

  getContext() {
    return {
      userId: this.userId,
      playlistId: this.playlistId,
      albumId: this.albumId
    }
  }

  getTitlePlaylist() {
    return Playlist.getTitlePlaylist(this.items)
  }

  getMinimalTitlePlaylist() {
    return Playlist.getMinimalTitlePlaylist(this.items)
  }

  static Empty() {
    return new Playlist(null, null, null, null, [])
  }

  static getTitlePlaylist(playlist: Track[]) {
    var textualPlaylist = ""
    for (let track of playlist) {
      textualPlaylist += track.title + "\n"
    }
    return textualPlaylist
  }

  static getMinimalTitlePlaylist(playlist: Track[]) {
    var textualPlaylist = ""
    for (let track of playlist) {
      textualPlaylist += track.toString(true) + "\n"
    }
    return textualPlaylist
  }

  static textualPlaylistToPlaylist(
    textualPlaylist: string,
    noArtist: boolean = false
  ): Playlist {
    var textualTracks = textualPlaylist.trim().split("\n")
    var tracks = []
    for (let trackString of textualTracks) {
      var track = noArtist
        ? new Track(null, trackString)
        : Track.parse(trackString)
      if (track != null) tracks.push(track)
    }
    return new Playlist(null, null, null, null, tracks)
  }

  addTracks(items: any) {
    this.offset += items.length
    const tracks = Playlist.createTracks(items)
    this.items = this.items.concat(tracks)
  }

  hasMore(): boolean {
    return this.offset < this.totalCount
  }

  static createTracks(items): Track[] {
    var tracks = []
    for (let item of items) {
      var track = Track.fromSpotify(item.track || item)
      if (track == null) continue
      tracks.push(track)
    }
    return tracks
  }

  private static createFromRawSpotifyReply(
    userId: string,
    playlistId: string,
    albumId: string,
    body: any
  ) {
    const tracks = this.createTracks(body.tracks.items)
    const playlist = new Playlist(
      userId,
      playlistId,
      albumId,
      body.name,
      tracks,
      body.tracks.total
    )
    playlist.offset = body.tracks.limit
    return playlist
  }

  static createFromAlbum(albumId: string, body: any) {
    return this.createFromRawSpotifyReply(null, null, albumId, body)
  }

  static createFromPlaylist(userId: string, playlistId: string, body: any) {
    return this.createFromRawSpotifyReply(userId, playlistId, null, body)
  }
}
