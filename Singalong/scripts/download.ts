import request = require('request-promise');
import cheerio = require('cheerio');
var validUrl = require('valid-url');

// Download a file form a url.
export async function downloadUrl(url, lyricsLocation) {
    var res = await request(url);
    var $ = cheerio.load(res);
    var result = $(lyricsLocation).text().trim();
    return result;
};

export async function searchLyrics(artist, title, searchQuery, hitFunc, lyricsLocation) {
    var res = await request(searchQuery + artist.replace(' ', '+') + '+' + title.replace(' ', '+'));
    var $ = cheerio.load(res);

    var firstHit = '';
    let i : number = 1;
    while (!validUrl.isUri(firstHit) && firstHit !== undefined) {
        firstHit = $(hitFunc(i)).attr('href');
        if (firstHit !== undefined && firstHit.indexOf("http") === -1) {
            firstHit = "https://www.musixmatch.com" + firstHit;
        }
    }
    if (!validUrl.isUri(firstHit)) return '';
    return await downloadUrl(firstHit, lyricsLocation);
}

export async function searchAzLyrics(artist, title) {
    return await searchLyrics(artist, title,
        'https://search.azlyrics.com/search.php?q=',
        i => 'tbody>tr:nth-child(' + i++ + ')>td>a',
        '.row>div>div:not([class])'
    );
}

export async function searchGenius(artist, title) {
    return await searchLyrics(artist, title,
        'https://genius.com/search?q=',
        i => 'tbody>tr:nth-child(' + i++ + ')>td>a',
        '.row>div>div:not([class])'
    );
}

export async function searchMetro(artist, title) {
    return await searchLyrics(artist, title,
        'http://www.metrolyrics.com//search.html?search=',
        i => 'tbody>tr:nth-child(' + i++ + ')>td>a',
        '.row>div>div:not([class])'
    );
}

export async function searchMatch(artist, title) {
    return await searchLyrics(artist, title,
        'https://www.musixmatch.com/search/',
        i => '.title',
        '.mxm-lyrics>span'
    );
}

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function createSongbook(playlist, searchFunc) {
    var tracks = playlist.trim().split('\n');
    var book = [];
    for (let track of tracks) {
        var trackItems = track.split('-');
        if (trackItems.length < 1) continue;
        let artist = trackItems[0];
        let title = trackItems.length === 2 ? trackItems[1] : '';
        var lyrics = await searchFunc(artist, title);
        await snooze(100);
        book.push({artist: artist, title: title, lyrics: lyrics});
    }
    return book;
}