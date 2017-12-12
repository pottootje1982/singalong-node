var lyrics_db = require('./lyrics_db');
import { Track } from "./Track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import { AzLyricsEngine } from "./LyricsEngines/AzLyricsEngine";
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from "./LyricsEngines/GeniusEngine";
import { MusixMatchEngine } from "./LyricsEngines/MusixMatchEngine";
//import { SongtekstenEngine } from "./LyricsEngines/SongtekstenEngine";
import { LyricsFreakEngine } from "./LyricsEngines/LyricsFreakEngine";

let engineIndex = -1;

const snooze = (ms : number, deviation : number = 0, offset : number = 0) => {
    ms = (1 - offset) * ms + Math.random() * ms * deviation;
    console.log("Waiting " + ms.toString() + " ms");
    return new Promise(resolve => setTimeout(resolve, ms));
};

export let engines: { [engineKey: string]: LyricsSearchEngine; } = {
    'AzLyrics': new AzLyricsEngine(),
    // Unreliable results, not nicely formatted
    //'MetroLyrics': new MetroLyricsEngine(),
    'Genius': new GeniusEngine(),
    'MusixMatch': new MusixMatchEngine(),
    // Says 'do not have rights to display lyrics'. However pasting the same URL in a browser does work
    //'Songteksten': new SongtekstenEngine(),
    'LyricsFreak': new LyricsFreakEngine()
};

export async function getLyricsFromDatabase(playlist: Track[], pushAllTracks : boolean = true) {
    var lyricsFromDatabase = [];
    for (let track of playlist) {
        var cached = await lyrics_db.queryTrack(track);
        let trackResult = new Track(track.artist, track.title);
        if (cached != null) {
            trackResult.site = cached.site;
            trackResult.lyrics = cached.lyrics;
        }
        if (pushAllTracks || cached != null)
            lyricsFromDatabase.push(trackResult);
    }
    return lyricsFromDatabase;
}

export function textualPlaylistToPlaylist(textualPlaylist : string) {
    var textualTracks = textualPlaylist.trim().split('\n');
    var tracks = [];
    for (let trackString of textualTracks) {
        var track = Track.parse(trackString);
        if (track != null)
            tracks.push(track);
    }
    return tracks;
}

export async function downloadTrack(track : Track, sleepTime : number = 3000) {
    if (track == null) return null;
    var cached = await lyrics_db.queryTrack(track);
    if (cached != null) return cached;
    let lyrics: string = null;
    let searchEngineName: string = null;
    let keys = Object.keys(engines);
    for (let i = 1; i <= keys.length && lyrics == null; i++) {
        let index = (i + engineIndex) % keys.length;

        if (engineIndex >= 0 && index === 0) {
            await snooze(sleepTime, 0.5, 0.2);
        }

        let key = keys[index];
        var searchEngine = engines[key];
        try {
            lyrics = await engines[key].searchLyrics(track.artist, track.title);
            if (lyrics != null) {
                searchEngineName = searchEngine.name;
                console.log('Found lyrics:\n' + lyrics.substr(0, 100) + '\nwith: ' + searchEngineName + '\n');
                engineIndex = index;
            } else {
                console.log('Did not find ' + track + ' with: ' + searchEngine.name + '\n');
            }
        } catch (error) {
            console.log(error);
        }
    }
    console.log('\n');
    track.site = searchEngineName;
    track.lyrics = lyrics;
    if (lyrics != null && searchEngineName != null) {
        lyrics_db.insert(track, lyrics);
    }
    return track;
}

export async function createSongbook(playlist : string, sleepTime : number = 0) : Promise<Track[]> {
    var tracks = textualPlaylistToPlaylist(playlist);
    var book = [];
    var tracksNotFound = [];
    for (let track of tracks) {
        track = await downloadTrack(track, sleepTime);
        book.push(track);
        if (track.lyrics == null) {
            tracksNotFound.push(track);
        }
    }
    console.log('Finished downloading lyrics');
    console.log('Tracks not found: ' + tracksNotFound.toString());
    return book;
}