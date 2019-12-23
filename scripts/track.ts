var track_helpers = require("../public/javascripts/track_helpers")

export class Track {
  getQueryTitle(): any {
    throw new Error("Method not implemented.")
  }
  id: string
  artist: string
  title: string
  site: string
  lyrics: string
  fullTrackTitle: string
  duration_ms: number

  constructor(
    artist: string,
    title: string,
    site?: string,
    lyrics?: string,
    fullTrackTitle?: string,
    id?: string
  ) {
    this.artist = artist ? artist.trim() : ""
    this.title = title ? title.trim() : ""
    this.site = site
    this.lyrics = lyrics
    this.fullTrackTitle = fullTrackTitle
    this.id = id
  }

  public toString(minimal: boolean = false): string {
    if (this.fullTrackTitle != null && !minimal) return this.fullTrackTitle
    let title = minimal ? this.getMinimalTitle() : this.title
    if (this.artist == null || this.artist === "") return title
    return this.artist + " - " + title
  }

  public static parse(trackStr: string): Track {
    var trackItems = trackStr.split(" - ")
    if (trackItems.length < 1) return null
    let artist = trackItems.length === 1 ? "" : trackItems[0].trim()
    if (trackItems.length > 1) trackItems.splice(0, 1)
    let title = trackItems.join(" - ").trim()
    if (artist === "" && title === "") return null
    let track = new Track(artist, title)
    track.fullTrackTitle = trackStr
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

  static copy(track) {
    return new Track(
      track.artist,
      track.title,
      track.site,
      track.lyrics,
      track.fullTrackTitle,
      track.id
    )
  }

  static fromSpotify(track): Track {
    if (track == null) return null
    const artist = track.artists ? track.artists[0].name : ""
    const title = track.name
    // if (track.preview_url == null) return null
    let result = new Track(artist, title)
    result.id = track.id
    result.duration_ms = track.duration_ms
    return result
  }

  static toTracks(playlist: any[]) {
    return playlist.map(track => Track.copy(track))
  }

  getMinimalTitle() {
    return track_helpers.getMinimalTitle(this.title)
  }
}
