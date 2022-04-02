import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class GeniusEngine extends LyricsSearchEngine {
    getHit(i: number) { }

    constructor() {
        super('Genius',
            { domain: 'https://www.genius.com', searchQuery: 'https://genius.com/api/search/multi?per_page=5&q=', lyricsLocation: '#lyrics-root', convertHtml: true });
    }

    public async searchLyrics(artist, title) {
        var res = await super.searchSite(artist, title);
        var results = JSON.parse(res);
        var songs = results.response.sections.filter(item => item.type === 'song');
        let hits = songs[0].hits;
        if (hits.length === 0) return null;
        var url = hits[0].result.path;
        return await super.downloadUrl('https://www.genius.com' + url);
    }

    protected replaceInLyrics($) {
        $('a').removeAttr('href')
        $('#lyrics-root > [data-lyrics-container!=true]').remove()
        var lyrics = super.replaceInLyrics($)
        return lyrics
    }
}