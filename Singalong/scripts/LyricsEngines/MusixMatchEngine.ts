import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class MusixMatchEngine extends LyricsSearchEngine {
    getHit(i: number) {
        return '.title';
    }

    constructor() {
        super('MusixMatch', 'https://www.musixmatch.com', 'https://www.musixmatch.com/search/', '.mxm-lyrics>span,p');
    }
}