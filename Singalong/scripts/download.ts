var lyrics_db = require('./lyrics_db');
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

export async function createSongbook(playlist, sleepTime = 0) {
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
                searchEngineName = searchEngine.getName();
                console.log('Found lyrics:\n' + lyrics.substr(0, 100) + '\nwith: ' + searchEngineName + '\n');
                engineIndex = index;
            } else {
                console.log('Did not find ' + track + ' with: ' + searchEngine.getName() + '\n');
            }
            if (track !== tracks[tracks.length - 1] && index === 0) {
                console.log("Waiting " + sleepTime + " ms");
                await snooze(sleepTime);
            }
        }
        console.log('\n');
        book.push({ artist: artist, title: title, lyrics: lyrics, searchEngine: cached != null ? cached.Site : searchEngineName});
        if (lyrics != null && searchEngineName != null) {
            lyrics_db.insert(artist, title, searchEngineName, lyrics);
        }
    }
    console.log('Finished downloading lyrics');
    return book;
}