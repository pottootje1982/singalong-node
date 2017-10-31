import request = require('request-promise');
import cheerio = require('cheerio');
var validUrl = require('valid-url');

// Download a file form a url.
export async function downloadUrl(url) {
    var res = await request(url);
    var $ = cheerio.load(res);
    var result = $('.row>div>div:not([class])').text().trim();
    return result;
};

export async function searchAzLyrics(artist, title) {
    var res = await request('https://search.azlyrics.com/search.php?q=' + artist + '+' + title);
    var $ = cheerio.load(res);

    var firstHit = '';
    let i : number = 1;
    while (!validUrl.isUri(firstHit)) {
        firstHit = $('tbody>tr:nth-child(' + i++ + ')>td>a').attr('href');
    }
    return await downloadUrl(firstHit);
}

export async function searchLyrics(playlist) {
    var tracks = playlist.trim().split('\n');
    var book = '';
    for (let track of tracks) {
        var trackItems = track.split('-');
        if (trackItems.length < 1) continue;
        var lyrics = await searchAzLyrics(trackItems[0], trackItems.length === 2 ? trackItems[1] : '');
        book += track + '\n\n' + lyrics + '\n\n';
    }
    return book;
}