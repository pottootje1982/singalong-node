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
        var result = $(this.lyricsLocation).text().trim();
        return result;
    };

    protected async searchSite(searchQuery: string, artist: string, title: string) {
        return request(searchQuery + artist.replace(' ', '+') + '+' + title.replace(' ', '+'));
    }

    protected getSearchQuery(): string {
        return this.searchQuery;
    }

    protected getDomain(): string {
        return this.domain;
    }

    public async searchLyrics(artist: string, title: string): Promise<string> {
        var res = await this.searchSite(this.searchQuery, artist, title);
        var $ = cheerio.load(res);

        var firstHit = '';
        let i: number = 1;
        while (!validUrl.isUri(firstHit) && firstHit !== undefined) {
            firstHit = $(this.getHit(i)).attr('href');
            if (firstHit !== undefined && firstHit.indexOf("http") === -1) {
                firstHit = this.domain + firstHit;
            }
        }
        if (!validUrl.isUri(firstHit)) return null;
        return await this.downloadUrl(firstHit);
    }

    protected abstract getHit(i: number);
}
