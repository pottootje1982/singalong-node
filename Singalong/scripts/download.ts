var lyrics_db = require('./lyrics_db');
import { Track } from "./Track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import { AzLyricsEngine } from "./LyricsEngines/AzLyricsEngine";
//import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from "./LyricsEngines/GeniusEngine";
import { MusixMatchEngine } from "./LyricsEngines/MusixMatchEngine";

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export let engines: { [engineKey: string]: LyricsSearchEngine; } = {
    'AzLyrics': new AzLyricsEngine(),
    //'MetroLyrics': new MetroLyricsEngine(),
    'Genius': new GeniusEngine(),
    'MusixMatch': new MusixMatchEngine(),
};

export async function getLyricsFromDatabase(playlist: Track[]) {
    var lyricsFromDatabase = [];
    for (let track of playlist) {
        var cached = await lyrics_db.query(track.artist, track.title);
        if (cached == null) continue;
        lyricsFromDatabase.push(new Track(track.artist, track.title, cached.Site, cached.Lyrics));
    }
    return lyricsFromDatabase;
}

export async function createSongbook(playlist : string, sleepTime : number = 0) : Promise<Track[]> {
    var tracks = playlist.trim().split('\n');
    var book = [];
    let engineIndex = -1;
    for (let track of tracks) {
        var trackItems = track.split('-');
        if (trackItems.length < 1) continue;
        let artist = trackItems[0].trim();
        let title = trackItems.length === 2 ? trackItems[1].trim() : '';
        var cached = await lyrics_db.query(artist, title);
        let lyrics: string = cached == null ? null : cached.Lyrics;
        let searchEngineName: string = null;
        let keys = Object.keys(engines);
        for (let i = 1; i <= keys.length && lyrics == null; i++) {
            let index = (i + engineIndex) % keys.length;
            let key = keys[index];
            var searchEngine = engines[key];
            lyrics = await engines[key].searchLyrics(artist, title);
            if (lyrics != null) {
                searchEngineName = searchEngine.name;
                console.log('Found lyrics:\n' + lyrics.substr(0, 100) + '\nwith: ' + searchEngineName + '\n');
                engineIndex = index;
            } else {
                console.log('Did not find ' + track + ' with: ' + searchEngine.name + '\n');
            }
            if (track !== tracks[tracks.length - 1] && index === 0) {
                console.log("Waiting " + sleepTime + " ms");
                await snooze(sleepTime);
            }
        }
        console.log('\n');
        book.push(new Track(artist, title, cached != null ? cached.Site : searchEngineName, lyrics));
        if (lyrics != null && searchEngineName != null) {
            lyrics_db.insert(artist, title, searchEngineName, lyrics);
        }
    }
    console.log('Finished downloading lyrics');
    return book;
}