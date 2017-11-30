import request = require('request-promise');
import cheerio = require('cheerio');
var validUrl = require('valid-url');

// Download a file form a url.
export async function downloadUrl(url, lyricsLocation) : Promise<string> {
    var res = await request(url);
    var $ = cheerio.load(res);
    var result = $(lyricsLocation).text().trim();
    return result;
};

async function searchSite(searchQuery, artist, title) {
    return request(searchQuery + artist.replace(' ', '+') + '+' + title.replace(' ', '+'));
}

export async function searchLyrics(artist, title, searchQuery, hitFunc, lyricsLocation): Promise<string> {
    var res = await searchSite(searchQuery, artist, title);
    var $ = cheerio.load(res);

    var firstHit = '';
    let i : number = 1;
    while (!validUrl.isUri(firstHit) && firstHit !== undefined) {
        firstHit = $(hitFunc(i)).attr('href');
        if (firstHit !== undefined && firstHit.indexOf("http") === -1) {
            firstHit = "https://www.musixmatch.com" + firstHit;
        }
    }
    if (!validUrl.isUri(firstHit)) return undefined;
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
    var res = await searchSite('https://genius.com/api/search/multi?per_page=5&q=', artist, title);
    var results = JSON.parse(res);
    var songs = results.response.sections.filter(item => item.type === 'song');
    var url = songs[0].hits[0].result.path;
    return await downloadUrl('https://www.genius.com' + url, '.lyrics');
}

export async function searchMetro(artist, title) {
    var res = await searchSite('http://api.metrolyrics.com/v1//multisearch/all/X-API-KEY/196f657a46afb63ce3fd2015b9ed781280337ea7/format/json?find=', artist, title);
    var results = JSON.parse(res);
    var songs = results.results.songs;
    var url = songs.d[0].u;
    var lyricsHtml = await request('http://www.metrolyrics.com/' + url);
    var $ = cheerio.load(lyricsHtml);
    $('#lyrics-body-text :not(.verse,br)').remove();
    $('<br/><br/>').insertAfter('.verse');
    return $('#lyrics-body-text').text();
}

export async function searchMatch(artist, title) {
    return await searchLyrics(artist, title,
        'https://www.musixmatch.com/search/',
        i => '.title',
        '.mxm-lyrics>span'
    );
}

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function createSongbook(playlist, searchFunc, sleepTime = 0) {
    var tracks = playlist.trim().split('\n');
    var book = [];
    for (let track of tracks) {
        var trackItems = track.split('-');
        if (trackItems.length < 1) continue;
        let artist = trackItems[0];
        let title = trackItems.length === 2 ? trackItems[1] : '';
        var lyrics = await searchFunc(artist, title);
        console.log('Found lyrics:\n' + lyrics + '\n\n');
        await snooze(sleepTime);
        book.push({artist: artist, title: title, lyrics: lyrics});
    }
    console.log('Finished downloading lyrics');
    return book;
}