var lyrics_db = require('./lyrics_db');
import { Track } from "./Track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import { AzLyricsEngine } from "./LyricsEngines/AzLyricsEngine";
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from "./LyricsEngines/GeniusEngine";
import { MusixMatchEngine } from "./LyricsEngines/MusixMatchEngine";
import { SongtekstenEngine } from "./LyricsEngines/SongtekstenEngine";

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export let engines: { [engineKey: string]: LyricsSearchEngine; } = {
    'AzLyrics': new AzLyricsEngine(),
    //'MetroLyrics': new MetroLyricsEngine(),
    'Genius': new GeniusEngine(),
    'MusixMatch': new MusixMatchEngine(),
    'Songteksten': new SongtekstenEngine()
};

export async function getLyricsFromDatabase(playlist: Track[]) {
    var lyricsFromDatabase = [];
    for (let track of playlist) {
        var cached = await lyrics_db.queryTrack(track);
        if (cached == null) continue;
        lyricsFromDatabase.push(new Track(track.artist, track.title, cached.Site, cached.Lyrics));
    }
    return lyricsFromDatabase;
}

export function textualPlaylistToTextualPlaylist(textualPlaylist : string) {
    var textualTracks = textualPlaylist.trim().split('\n');
    var tracks = [];
    for (let trackString of textualTracks) {
        var track = Track.parse(trackString);
        tracks.push(track);
    }
    return tracks;
}

export async function createSongbook(playlist : string, sleepTime : number = 0) : Promise<Track[]> {
    var tracks = textualPlaylistToTextualPlaylist(playlist);
    var book = [];
    let engineIndex = -1;
    for (let track of tracks) {
        if (track == null) continue;
        var cached = await lyrics_db.queryTrack(track);
        let lyrics: string = cached == null ? null : cached.Lyrics;
        let searchEngineName: string = null;
        let keys = Object.keys(engines);
        for (let i = 1; i <= keys.length && lyrics == null; i++) {
            let index = (i + engineIndex) % keys.length;
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
            if (track !== tracks[tracks.length - 1] && index === 0) {
                console.log("Waiting " + sleepTime + " ms");
                await snooze(sleepTime);
            }
        }
        console.log('\n');
        track.site = cached != null ? cached.Site : searchEngineName;
        track.lyrics = lyrics;
        book.push(track);
        if (lyrics != null && searchEngineName != null) {
            lyrics_db.insert(track.artist, track.title, searchEngineName, lyrics);
        }
    }
    console.log('Finished downloading lyrics');
    return book;
}