import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class SongtekstenEngine extends LyricsSearchEngine {
    getHit(i: number) {
        return '.r>a';
    }

    constructor() {
        super('Songteksten', 'https://www.songteksten.nl', 'https://www.google.nl/search?q=songteksten.nl+', 'p:first', 'data-href');
    }
}