var lyrics_db = require('./lyrics_db')
import { Track } from './track'
import { LyricsSearchEngine } from './LyricsEngines/LyricsSearchEngine'
import { AzLyricsEngine } from './LyricsEngines/AzLyricsEngine'
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from './LyricsEngines/GeniusEngine'
import { MusixMatchEngine } from './LyricsEngines/MusixMatchEngine'
//import { SongtekstenEngine } from "./LyricsEngines/SongtekstenEngine";
import { LyricsFreakEngine } from './LyricsEngines/LyricsFreakEngine'
import { Playlist } from './Playlist'

let engineIndex = -1

const snooze = (ms: number, deviation: number = 0, offset: number = 0) => {
  ms = (1 - offset) * ms + Math.random() * ms * deviation
  console.log('Waiting ' + ms.toString() + ' ms')
  return new Promise(resolve => setTimeout(resolve, ms))
}

export let engines: { [engineKey: string]: LyricsSearchEngine } = {
  AzLyrics: new AzLyricsEngine(),
  // Unreliable results, not nicely formatted
  //'MetroLyrics': new MetroLyricsEngine(),
  Genius: new GeniusEngine(),
  MusixMatch: new MusixMatchEngine(),
  // Says 'do not have rights to display lyrics'. However pasting the same URL in a browser does work
  //'Songteksten': new SongtekstenEngine(),
  LyricsFreak: new LyricsFreakEngine()
}

export async function getLyricsFromDatabase(
  playlist: Track[],
  pushAllTracks: boolean = true
) {
  var lyricsFromDatabase = []
  for (let track of playlist) {
    var cached = await lyrics_db.queryTrack(track)
    if (cached != null) {
      track.site = cached.site
      track.lyrics = cached.lyrics
    }
    if (pushAllTracks || cached != null) lyricsFromDatabase.push(track)
  }
  return lyricsFromDatabase
}

async function getFromCache(track: Track) {
  var cached = await lyrics_db.queryTrack(track)
  if (cached != null) {
    if (!cached.id) {
      cached.id = track.id
      lyrics_db.updateId(cached)
    }
    return cached
  }
  return null
}

export async function downloadTrack(
  track: Track,
  sleepTime: number = 3000,
  getCached?: boolean
) {
  if (track == null) return null
  if (getCached) {
    var cached = await getFromCache(track)
    if (cached) return cached
  }
  let lyrics: string = null
  let searchEngineName: string = null
  let keys = Object.keys(engines)
  for (let i = 1; i <= keys.length && lyrics == null; i++) {
    let index = (i + engineIndex) % keys.length

    if (engineIndex >= 0 && index === 0) {
      await snooze(sleepTime, 0.5, 0.2)
    }

    let key = keys[index]
    var searchEngine = engines[key]
    try {
      lyrics = await engines[key].searchLyrics(track.artist, track.title)
      if (lyrics != null) {
        searchEngineName = searchEngine.name
        console.log(
          'Found lyrics:\n' +
            lyrics.substr(0, 100) +
            '\nwith: ' +
            searchEngineName +
            '\n'
        )
        engineIndex = index
      } else {
        console.log(
          'Did not find ' + track + ' with: ' + searchEngine.name + '\n'
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
  console.log('\n')
  track.site = searchEngineName
  track.lyrics = lyrics
  if (lyrics != null && searchEngineName != null) {
    lyrics_db.updateOrInsert(track, lyrics)
  }
  return track
}

export async function createSongbook(
  textualPlaylist: string,
  sleepTime: number = 0
): Promise<Track[]> {
  var playlist = Playlist.textualPlaylistToPlaylist(textualPlaylist)
  var book = []
  var tracksNotFound = []
  for (let track of playlist.items) {
    track = await downloadTrack(track, sleepTime)
    book.push(track)
    if (track.lyrics == null) {
      tracksNotFound.push(track)
    }
  }
  console.log('Finished downloading lyrics')
  console.log('Tracks not found: ' + tracksNotFound.toString())
  return book
}
