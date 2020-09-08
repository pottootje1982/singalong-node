import LyricsDb from './lyrics_db'
import { Track } from '../client/src/track'
import { LyricsSearchEngine } from './LyricsEngines/LyricsSearchEngine'
import { AzLyricsEngine } from './LyricsEngines/AzLyricsEngine'
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from './LyricsEngines/GeniusEngine'
import { MusixMatchEngine } from './LyricsEngines/MusixMatchEngine'
//import { SongtekstenEngine } from "./LyricsEngines/SongtekstenEngine";
import { LyricsFreakEngine } from './LyricsEngines/LyricsFreakEngine'

let engineIndex = -1

const snooze = (ms: number, deviation: number = 0, offset: number = 0) => {
  ms = (1 - offset) * ms + Math.random() * ms * deviation
  console.log('Waiting ' + ms.toString() + ' ms')
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default class LyricsDownloader {
  engines: { [engineKey: string]: LyricsSearchEngine }
  lyricsDb: LyricsDb

  constructor(lyricsDb: LyricsDb) {
    this.lyricsDb = lyricsDb
    this.engines = {
      AzLyrics: new AzLyricsEngine(),
      // Unreliable results, not nicely formatted
      //'MetroLyrics': new MetroLyricsEngine(),
      Genius: new GeniusEngine(),
      MusixMatch: new MusixMatchEngine(),
      // Says 'do not have rights to display lyrics'. However pasting the same URL in a browser does work
      //'Songteksten': new SongtekstenEngine(),
      LyricsFreak: new LyricsFreakEngine(),
    }
  }

  async getLyricsFromDatabase(
    playlist: Track[],
    pushAllTracks: boolean = true
  ) {
    var lyricsFromDatabase = []
    for (let track of playlist) {
      var cached = await this.lyricsDb.queryTrack(track)
      if (cached != null) {
        track.site = cached.site
        track.lyrics = cached.lyrics
      }
      if (pushAllTracks || cached != null) lyricsFromDatabase.push(track)
    }
    return lyricsFromDatabase
  }

  async getFromCache(track: Track) {
    var cached = await this.lyricsDb.queryTrack(track)
    if (cached != null) {
      if (!cached.id && track.id) {
        this.lyricsDb.updateId(Track.copy({ ...cached, id: track.id }))
      }
      return cached
    }
    return null
  }

  async downloadTrack(
    track: Track,
    sleepTime: number = 3000,
    getCached?: boolean,
    save?: boolean
  ) {
    if (track == null) return null
    if (getCached) {
      var cached = await this.getFromCache(track)
      if (cached && cached.lyrics && cached.lyrics !== '') return cached
    }
    let lyrics: string = null
    let searchEngineName: string = null
    let keys = Object.keys(this.engines)
    for (let i = 1; i <= keys.length && lyrics == null; i++) {
      let index = (i + engineIndex) % keys.length

      if (engineIndex >= 0 && index === 0) {
        await snooze(sleepTime, 0.5, 0.2)
      }

      let key = keys[index]
      var searchEngine = this.engines[key]
      try {
        lyrics = await this.engines[key].searchLyrics(track.artist, track.title)
        if (lyrics && lyrics !== '') {
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
    if (lyrics && searchEngineName && save !== false) {
      console.log(`Saving ${track.toString()} to db`)
      this.lyricsDb.updateOrInsert(track, lyrics)
    }
    return track
  }
}
