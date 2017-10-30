"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var cheerio = require("cheerio");
// Download a file form a url.
function downloadUrl(url, onDownload) {
    request(url, function (err, response, body) {
        var $ = cheerio.load(body);
        var result = $('.row>div>div:not([class])').text().trim();
        onDownload(result);
    });
}
exports.downloadUrl = downloadUrl;
;
var google = require('googleapis');
var customsearch = google.customsearch('v1');
var GoogleSearchEngineId = '001370558942567253574:kcolq4oco7w';
var GoogleApiKey = 'AIzaSyAbzN37396jG-c0BpUFWzb78FRu4QnBK9M';
function search(artist, title, onResponse) {
    customsearch.cse.list({ q: artist + ' ' + title + ' lyrics', auth: GoogleApiKey, cx: GoogleSearchEngineId }, function (err, resp) {
        if (err) {
            return console.log('An error occured', err);
        }
        // Got the response from custom search
        console.log('Result: ' + resp.searchInformation.formattedTotalResults);
        if (resp.items && resp.items.length > 0) {
            console.log('First result name is ' + resp.items[0].formattedUrl);
        }
        downloadUrl(resp.items[0].formattedUrl, onResponse);
    });
}
exports.search = search;
function searchAzLyrics(artist, title, onResponse) {
    request('https://search.azlyrics.com/search.php?q=' + artist + '+' + title, function (_, __, res) {
        var $ = cheerio.load(res);
        var firstHit = $('tbody>tr:nth-child(1)>td>a').attr('href');
        downloadUrl(firstHit, onResponse);
    });
}
exports.searchAzLyrics = searchAzLyrics;
//# sourceMappingURL=download.js.map