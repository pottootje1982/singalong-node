import {Track} from "./track";
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine";
import download = require('./download');
import express = require('express');

export class Context {
    userId: string;
    textualPlaylist: string = 'yellow submarine\nanother day';
    playlists: string[] = [];
    playlist: Track[] = [];
    searchedDb: false;
    selectedTrack: string;
    selPlaylistId: string;
    playlistUserId: string;
    engines: { [engineKey: string]: LyricsSearchEngine; };
    error: string = null;
    showSpotifyPlayer = true;
    res: express.Response;

    constructor() {
        this.engines = download.engines;
    }

    showError(message: string, error: string) {
        this.error = message + ": " + error;
        this.res.render('index', this);
    }
}

export let contexts: { [userKey: string]: Context; } = {
};

export function getOrAdd(userKey: string) {
    if (contexts[userKey] != null) return contexts[userKey];
    contexts[userKey] = new Context();
    return contexts[userKey];
}

