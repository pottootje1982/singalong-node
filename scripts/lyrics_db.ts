import { Track } from '../client/src/track'

export default class LyricsDb {
  removeAll() {
    return this.lyricsTable.remove()
  }

  lyricsTable: any

  constructor(lyricsTable) {
    this.lyricsTable = lyricsTable
  }

  artistTitleQuery(artist: string, title: string) {
    const query: any = {
      title: new RegExp(title, 'i'),
    }
    if (artist) query.artist = new RegExp(artist, 'i')
    return query
  }

  async query(artist: string, title: string, id?: string): Promise<Track[]> {
    if (title === '' || !title) return null
    let query = this.artistTitleQuery(artist, title)
    if (id) {
      query = { $or: [query, { id }] }
    }
    const results = await this.lyricsTable.get(query)
    if (results.length === 0) return null
    return results.map(Track.copy)
  }

  async queryTrack(track: Track): Promise<Track> {
    try {
      var tracks = await this.query(null, track.title, track.id)
      if (tracks == null && track.canClean())
        tracks = await this.query(track.cleanArtist(), track.cleanTitle())
      if (tracks == null) return null
      var result: Track
      var filteredTracks = tracks.filter((t) => t.matchesArtistTitleOrId(track))
      result = filteredTracks[0]
      return result
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async queryPlaylist(
    playlist: Track[],
    notDownloaded?: boolean
  ): Promise<Track[]> {
    const results: Track[] = []
    if (playlist.length === 0) return results
    let orSection: any = playlist.map((track) => {
      const expression: Array<any> = [
        { title: new RegExp(track.getMinimalTitle(), 'i') },
      ]
      const id = track.id
      if (id) expression.push({ id })
      return expression
    })
    orSection = [].concat(...orSection)
    var query = {
      $or: orSection,
    }
    let queryResults: any[] = (await this.lyricsTable.get(query)) || []
    for (let track of playlist) {
      var matches = queryResults.filter((match) =>
        track.matchesTitleOrId(match)
      )
      if (matches.length === 0) {
        results.push(track)
        continue
      }
      if (notDownloaded === false) continue
      const exactMatch = matches.find((match) =>
        track.matchesArtistTitleOrId(match)
      )
      track.lyrics = exactMatch && exactMatch.lyrics
      results.push(track)
    }
    return results
  }

  insert(track: Track, lyrics: string) {
    return this.lyricsTable.store({
      artist: track.artist,
      title: track.title,
      site: track.site || null,
      lyrics: lyrics,
      id: track.id || null,
    })
  }

  updateId(track: Track) {
    var query = this.artistTitleQuery(track.artist, track.title)
    if (track.id) return this.lyricsTable.update(query, { id: track.id })
  }

  update(track: Track, lyrics: string) {
    var query = this.artistTitleQuery(track.artist, track.title)
    return this.lyricsTable.update(query, { lyrics })
  }

  async updateOrInsert(track: Track, lyrics: string) {
    var result = await this.queryTrack(track)
    if (result == null) await this.insert(track, lyrics)
    else await this.update(result, lyrics)
  }

  async remove(track: Track) {
    var foundTrack = await this.queryTrack(track)
    if (foundTrack) {
      return this.lyricsTable.remove({
        artist: foundTrack.artist,
        title: foundTrack.title,
      })
    }
  }
}
