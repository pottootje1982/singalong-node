import request = require('request-promise');
import cheerio = require('cheerio');
import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class MetroLyricsEngine extends LyricsSearchEngine {
    getHit(i: number) {}

    constructor() {
        super('http://www.metrolyrics.com', 'http://api.metrolyrics.com/v1/multisearch/all/X-API-KEY/196f657a46afb63ce3fd2015b9ed781280337ea7/format/json?find=', undefined);
    }

    public async searchLyrics(artist, title) {
        var res = await this.searchSite(this.getSearchQuery(), artist, title);
        var results = JSON.parse(res);
        var songs = results.results.songs;
        var url = songs.d[0].u;
        var lyricsHtml = await request('http://www.metrolyrics.com/' + url);
        var $ = cheerio.load(lyricsHtml);
        $('#lyrics-body-text :not(.verse,br)').remove();
        $('<br/><br/>').insertAfter('.verse');
        return $('#lyrics-body-text').text();
    }
}