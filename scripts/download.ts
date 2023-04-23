import LyricsTable from "./db/table/lyrics";
import { Track } from "../client/src/track";
import {
  LyricsSearchEngine,
  AzLyricsEngine,
  GeniusEngine,
  MusixMatchEngine,
  LyricsFreakEngine,
  ChartLyricsEngine,
} from "./LyricsEngines";
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
//import { SongtekstenEngine } from "./LyricsEngines/SongtekstenEngine";

let engineIndex = -1;

const snooze = (ms: number, deviation: number = 0, offset: number = 0) => {
  ms = (1 - offset) * ms + Math.random() * ms * deviation;
  console.log("Waiting " + ms.toString() + " ms");
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default class LyricsDownloader {
  public engines: { [engineKey: string]: LyricsSearchEngine };
  lyricsDb: LyricsTable;

  constructor(lyricsDb: LyricsTable) {
    this.lyricsDb = lyricsDb;
    this.engines = {
      AzLyrics: new AzLyricsEngine(),
      // Unreliable results, not nicely formatted
      //'MetroLyrics': new MetroLyricsEngine(),
      Genius: new GeniusEngine(),
      MusixMatch: new MusixMatchEngine(),
      // Says 'do not have rights to display lyrics'. However pasting the same URL in a browser does work
      //'Songteksten': new SongtekstenEngine(),
      LyricsFreak: new LyricsFreakEngine(),
      ChartLyrics: new ChartLyricsEngine(),
    };
  }

  async getLyricsFromDatabase(
    playlist: Track[],
    pushAllTracks: boolean = true
  ) {
    var lyricsFromDatabase = [];
    for (let track of playlist) {
      var cached = await this.lyricsDb.queryTrack(track);
      if (cached != null) {
        track.site = cached.site;
        track.lyrics = cached.lyrics;
      }
      if (pushAllTracks || cached != null) lyricsFromDatabase.push(track);
    }
    return lyricsFromDatabase;
  }

  async getFromCache(track: Track) {
    var cached = await this.lyricsDb.queryTrack(track);
    if (cached != null) {
      if (!cached.id && track.id) {
        this.lyricsDb.updateId(Track.copy({ ...cached, id: track.id }));
      }
      return cached;
    }
    return null;
  }

  async downloadTrack(
    track: Track,
    sites: string[] = Object.keys(this.engines),
    sleepTime: number = 3000,
    getCached?: boolean,
    save?: boolean
  ) {
    if (track == null) return null;
    if (getCached) {
      var cached = await this.getFromCache(track);
      if (cached && cached.lyrics && cached.lyrics !== "") return cached;
    }
    let lyrics: string = null;
    let searchEngineName: string = null;
    for (let i = 1; i <= sites.length && lyrics == null; i++) {
      let index = (i + engineIndex) % sites.length;

      if (engineIndex >= 0 && index === 0) {
        await snooze(sleepTime, 0.5, 0.2);
      }

      let key = sites[index];
      var searchEngine = this.engines[key];
      try {
        lyrics = await this.engines[key].searchLyrics(
          track.cleanArtist(),
          track.getMinimalTitle()
        );
        if (lyrics) {
          searchEngineName = searchEngine.key;
          engineIndex = index;
        } else {
          console.log(
            "Did not find " + track + " with: " + searchEngine.key + "\n"
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
    track.site = searchEngineName;
    track.lyrics = lyrics;
    if (lyrics && searchEngineName && save !== false) {
      await this.lyricsDb.updateOrInsert(track, lyrics);
    }
    return track;
  }
}
