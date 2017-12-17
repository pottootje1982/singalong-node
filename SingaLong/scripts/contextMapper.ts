import {Track} from "./track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import download = require('./download');

export class Context {
    textualPlaylist: string = 'yellow submarine\nanother day';
    playlists: string[] = [];
    playlist: Track[] = [];
    engines: { [engineKey: string]: LyricsSearchEngine; };

    constructor() {
        this.engines = download.engines;
    }
}

