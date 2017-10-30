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

var google = require('googleapis');
var customsearch = google.customsearch('v1');

var GoogleSearchEngineId = '001370558942567253574:kcolq4oco7w';
var GoogleApiKey = 'AIzaSyAbzN37396jG-c0BpUFWzb78FRu4QnBK9M';

export function search(artist, title, onResponse) {
    customsearch.cse.list({ q: artist + ' ' + title + ' lyrics', auth: GoogleApiKey, cx: GoogleSearchEngineId }, (err, resp) => {
        if (err) {
            return console.log('An error occured', err);
        }
        // Got the response from custom search
        console.log('Result: ' + resp.searchInformation.formattedTotalResults);
        if (resp.items && resp.items.length > 0) {
            console.log('First result name is ' + resp.items[0].formattedUrl);
        }
        downloadUrl(resp.items[0].formattedUrl).then(onResponse);
    });
}

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