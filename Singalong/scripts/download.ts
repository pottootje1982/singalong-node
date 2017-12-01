import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import { AzLyricsEngine } from "./LyricsEngines/AzLyricsEngine";
import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";
import { GeniusEngine } from "./LyricsEngines/GeniusEngine";
import { MusixMatchEngine } from "./LyricsEngines/MusixMatchEngine";

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export var engines: { [engineKey: string]: LyricsSearchEngine; } = {
    'AzLyrics': new AzLyricsEngine(),
    'MetroLyrics': new MetroLyricsEngine(),
    'Genius': new GeniusEngine(),
    'MusixMatch': new MusixMatchEngine(),
};

export async function createSongbook(playlist, searchEngine: LyricsSearchEngine, sleepTime = 0) {
    var tracks = playlist.trim().split('\n');
    var book = [];
    for (let track of tracks) {
        var trackItems = track.split('-');
        if (trackItems.length < 1) continue;
        let artist = trackItems[0];
        let title = trackItems.length === 2 ? trackItems[1] : '';
        var lyrics = await searchEngine.searchLyrics(artist, title);
        console.log('Found lyrics:\n' + lyrics + '\n\n');
        await snooze(sleepTime);
        book.push({artist: artist, title: title, lyrics: lyrics});
    }
    console.log('Finished downloading lyrics');
    return book;
}