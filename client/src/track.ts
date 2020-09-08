var track_helpers = require('./track_helpers')

function includes(str1, str2) {
  return str1.toUpperCase().includes(str2.toUpperCase())
}

function equals(str1, str2) {
  return str1.toUpperCase() === str2.toUpperCase()
}

export class Track {
  readonly id: string
  readonly artist: string
  readonly title: string
  site: string
  lyrics: string
  readonly duration_ms: number

  constructor(
    artist: string,
    title: string,
    id?: string,
    site?: string,
    lyrics?: string,
    duration_ms?: number
  ) {
    this.artist = artist ? artist.trim() : ''
    this.title = title ? title.trim() : ''
    this.site = site
    this.lyrics = lyrics
    this.id = id
    this.duration_ms = duration_ms
  }

  public static parse(trackStr: string): Track {
    var trackItems = trackStr.split(' - ')
    if (trackItems.length < 1) return null
    let artist = trackItems.length === 1 ? '' : trackItems[0].trim()
    if (trackItems.length > 1) trackItems.splice(0, 1)
    let title = trackItems.join(' - ').trim()
    if (artist === '' && title === '') return null
    let track = new Track(artist, title)
    return track
  }

  cleanArtist(): string {
    return track_helpers.cleanString(this.artist)
  }

  cleanTitle(): string {
    return track_helpers.cleanString(this.title)
  }

  canClean(): boolean {
    return (
      this.cleanArtist() !== this.artist || this.cleanTitle() !== this.title
    )
  }

  matchesTitleOrId(match: any): boolean {
    return (
      includes(match.title, this.getMinimalTitle()) || equals(match.id, this.id)
    )
  }

  matchesArtistTitleOrId(match: any): boolean {
    return (
      (includes(match.title, this.getMinimalTitle()) &&
        match.artist.toUpperCase() === this.artist.toUpperCase()) ||
      equals(match.id, this.id)
    )
  }

  static copy(track: any): Track {
    const result = new Track(
      track.artist,
      track.title,
      track.id,
      track.site,
      track.lyrics,
      track.duration_ms
    )
    return result
  }

  static fromSpotify(track): Track {
    if (track == null) return null
    const artist = track.artists ? track.artists[0].name : ''
    const title = track.name
    // if (track.preview_url == null) return null
    let result = new Track(
      artist,
      title,
      track.id,
      null,
      null,
      track.duration_ms
    )
    return result
  }

  getMinimalTitle() {
    return track_helpers.getMinimalTitle(this.title)
  }

  getTitle(minimalTitle?: boolean) {
    return minimalTitle ? this.getMinimalTitle() : this.title
  }

  toString(options?: any) {
    options = options || {}
    const { minimalTitle, hideArtist } = options
    const title = this.getTitle(minimalTitle)
    return this.artist && !hideArtist ? `${this.artist} - ${title}` : title
  }
}

export function createTrack(track: any) {
  let { id, name, artists, duration_ms } = track
  const artist = artists[0] && artists[0].name
  id = id || `${artist} - ${name}`
  return new Track(artist, name, id, null, null, duration_ms)
}
