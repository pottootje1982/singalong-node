var mysql = require('mysql');
import { Track } from './Track';

var connection = null;

function createConnection() {
    if (connection != null) connection.end();
    connection = mysql.createConnection({
        //host: '192.168.178.65',
        host: '87.195.169.201',
        port: 3307,
        user: 'pottootje1982',
        password: 'Icf5uEiPRtjXD7GK',
        database: 'singalong'
    });
    connection.connect();
}

createConnection();

// Default wait time out is 28800 seconds (8 hours), that's why we ping each hour the DB connection to avoid connection reset

setInterval(() => {
    executeQuery("SELECT 1", results => {
        console.log('Executed Database heartbeat');
        return results;
    });
}, 1000 * 3600);

function executeQuery(query : string, processResults = null) {
    return new Promise((resolve, reject) => {
        //console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) {
                    if (error.indexOf('ECONNRESET')) { // Reestablish connection in case of connection reset
                        console.log("Re-establishing connection");
                        createConnection();
                    }
                    reject(Error(error));
                }
                else resolve(processResults != null ? processResults(results) : results);
            });
    });
}

export function query(artist, title): Promise<Track[]> {
    if (title === '' || title == null) return null;
    var artistPart = artist != null ? 'Artist = ' + p(artist) + ' AND ' : '';
    let query = 'SELECT * FROM lyrics WHERE ' + artistPart + 'Title = ' + p(title);
    return executeQuery(query,
        results => {
            var tracks = [];
            for (let result of results)
                tracks.push(new Track(result.Artist, result.Title, result.Site, result.Lyrics));
            return results.length === 0 ? null : tracks;
        });
}

export async function queryTrack(track: Track) {
    try {
        var tracks = await query(null, track.title);
        if (tracks == null && track.canClean()) tracks = await query(track.cleanArtist(), track.cleanTitle());
        if (tracks == null) return null;
        if (tracks.length === 1) return tracks[0];
        else {
            var filteredTracks = tracks.filter(t => t.artist.toUpperCase() === track.artist.toUpperCase() &&
                t.title.toUpperCase() === track.title.toUpperCase());
            return filteredTracks.length === 0 ? tracks[0] : filteredTracks[0];
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export function insert(track: Track, lyrics: string) {
    let query = "INSERT INTO lyrics (Artist,Title,Site,Lyrics) " +
        'VALUES("' + track.artist + '", "' + track.title + '", "' + track.site + '", ' + formatLyrics(lyrics) + ')';
    return executeQuery(query);
}

function formatLyrics(lyrics: string) {
    return p(lyrics == null ? null : lyrics.replace(/"/g, '\\"'));
}

function p(value: string) {
    return value == null ? "NULL" : '"' + value.replace("&", "\&").replace('"', '\"').trim() + '"';
}

function updateInternal(track: Track, lyrics: string) {
    let query = "UPDATE lyrics " +
        'SET Site=' + p(track.site) + ', Lyrics=' + formatLyrics(lyrics) + ' ' +
        'WHERE Artist=' + p(track.artist) + ' AND Title=' + p(track.title);
    return executeQuery(query);
}

export async function update(track: Track, lyrics: string) {
    var result = await queryTrack(track);
    if (result == null) insert(track, lyrics);
    else updateInternal(result, lyrics);
}

export function remove(track: Track) {
    let query = "DELETE FROM lyrics " +
        'WHERE Artist=' + p(track.artist) + ' AND Title=' + p(track.title);
    return executeQuery(query);
}