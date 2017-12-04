import request = require('request-promise');
import cheerio = require('cheerio');
var validUrl = require('valid-url');

export abstract class LyricsSearchEngine {
    private lyricsLocation: string;
    private searchQuery: string;
    private domain: string;
    name: string;

    constructor(name: string, domain: string, searchQuery: string, lyricsLocation: string) {
        this.name = name;
        this.domain = domain;
        this.lyricsLocation = lyricsLocation;
        this.searchQuery = searchQuery;
    }

    // Download a file form a url.
    protected async downloadUrl(url: string): Promise<string> {
        var res = await request(url);
        var $ = cheerio.load(res);
        var lyrics = this.replaceInLyrics($);
        if (lyrics == null) return null;
        var result = lyrics.text().trim();
        return result;
    };

    private encode(str) {
        return encodeURIComponent(str.replace('&', '').replace(',', ''));
    }

    protected async searchSite(searchQuery: string, artist: string, title: string) {
        return request(searchQuery + this.encode(artist) + '+' + this.encode(title));
    }

    protected getSearchQuery(): string {
        return this.searchQuery;
    }

    protected getDomain(): string {
        return this.domain;
    }

    protected getQueryVariable(query, variable): string {
        query = query.match(/^[^\?]+\?(.*)/i);
        if (query.length <= 1) return null;
        query = query[1];
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

    public async searchLyrics(artist: string, title: string): Promise<string> {
        var res = await this.searchSite(this.searchQuery, artist, title);
        var $ = cheerio.load(res);

        var firstHit = '';
        let i: number = 1;
        while (!validUrl.isUri(firstHit) && firstHit !== undefined) {
            firstHit = this.getAttribute($(this.getHit(i)));
            if (firstHit !== undefined && firstHit.indexOf("http") === -1) {
                firstHit = this.domain + firstHit;
            }
        }
        if (!validUrl.isUri(firstHit)) return null;
        return await this.downloadUrl(firstHit);
    }

    protected abstract getHit(i: number);

    protected replaceInLyrics($) {
        return $(this.lyricsLocation);
    }

    protected getQueryAttribute(hit) {
        let href = hit.attr('href');
        let url = this.getQueryVariable(href, 'q');
        return url;
    }

    protected getAttribute(hit) {
        return hit.attr('href');
    }
}
