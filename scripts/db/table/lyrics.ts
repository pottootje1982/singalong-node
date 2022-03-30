import { Db } from 'mongodb'
import { Track } from '../../../client/src/track'
import Table from './table'

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

function regExp(text: string) {
  return new RegExp(escapeRegExp(text), 'i')
}

export default class LyricsTable extends Table {
  constructor(db: Db) {
    super(db, 'lyrics')
  }

  artistTitleQuery(artist: string, title: string) {
    const query: any = {
      title: regExp(title),
    }
    if (artist) query.artist = regExp(artist)
    return query
  }

  private artistTitleIdQuery(artist: string, title: string, id: string) {
    let query = this.artistTitleQuery(artist, title)
    if (id) {
      query = { $or: [query, { id }] }
    }
    return query
  }

  async query(artist: string, title: string, id?: string): Promise<Track[]> {
    if (title === '' || !title) return null
    let query = this.artistTitleIdQuery(artist, title, id)
    const results = await this.find(query)
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
        { title: regExp(track.getMinimalTitle()) },
      ]
      const id = track.id
      if (id) expression.push({ id })
      return expression

    })
    orSection = [].concat(...orSection)
    var query = {
      $or: orSection,
    }
    let queryResults: any[] = (await this.find(query)) || []
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

  public insert(track: Track, lyrics: string) {
    return this.table().insertOne({
      artist: track.artist,
      title: track.title,
      site: track.site || null,
      lyrics: lyrics,
      id: track.id || null,
    })
  }

  updateId(track: Track) {
    var query = this.artistTitleQuery(track.artist, track.title)
    if (track.id)
      return this.findOneAndUpdate(query, { id: track.id })
  }

  update(track: Track, lyrics: string) {
    var query = this.artistTitleQuery(track.artist, track.title)
    return this.findOneAndUpdate(query, { lyrics })
  }

  async updateOrInsert(track: Track, lyrics: string) {
    var result = await this.queryTrack(track)
    if (result == null) await this.insert(track, lyrics)
    else await this.update(result, lyrics)
  }

  async remove(track: Track) {
    const { artist, title, id } = track
    const query = this.artistTitleIdQuery(artist, title, id)
    return this.table().deleteOne(query)
  }
}
