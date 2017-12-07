import {Track} from "./track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import download = require('./download');

export class Context {
    userId: string;
    textualPlaylist: string;
    playlists: string[] = [];
    playlist: Track[] = [];
    selectedTrack: string;
    selPlaylistId: string;
    playlistUserId: string;
    engines: { [engineKey: string]: LyricsSearchEngine; };

    constructor() {
        this.engines = download.engines;
    }
}

export let contexts: { [userKey: string]: Context; } = {
};

export function getOrAdd(userKey: string) {
    if (contexts[userKey] != null) return contexts[userKey];
    contexts[userKey] = new Context();
    return contexts[userKey];
}

