import {LyricsSearchEngine} from "./LyricsSearchEngine";

export class GeniusEngine extends LyricsSearchEngine {
    getHit(i: number) {}

    constructor() {
        super('Genius', 'https://www.genius.com', 'https://genius.com/api/search/multi?per_page=5&q=', '.lyrics');
    }

    public async searchLyrics(artist, title) {
        var res = await super.searchSite(super.getSearchQuery(), artist, title);
        var results = JSON.parse(res);
        var songs = results.response.sections.filter(item => item.type === 'song');
        let hits = songs[0].hits;
        if (hits.length === 0) return null;
        var url = hits[0].result.path;
        return await super.downloadUrl('https://www.genius.com' + url);
    }
}