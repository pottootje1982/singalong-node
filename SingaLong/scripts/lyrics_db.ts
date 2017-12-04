var mysql = require('mysql');
import { Track } from './Track';

var connection = mysql.createConnection({
    //host: '192.168.178.65',
    host: '87.195.169.201',
    port: 3307,
    user: 'pottootje1982',
    password: 'Icf5uEiPRtjXD7GK',
    database: 'singalong'
});

connection.connect();

export function query(artist, title) : Promise<Track[]> {
    return new Promise((resolve, reject) => {
        if (title === '' || title == null) resolve(null);
        var artistPart = artist != null ? 'Artist = ' + p(artist) + ' AND ' : '';
        let query = 'SELECT * FROM lyrics WHERE ' + artistPart + 'Title = ' + p(title);
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else
                {
                    var tracks = [];
                    for (let result of results)
                        tracks.push(new Track(result.Artist, result.Title, result.Site, result.Lyrics));
                    resolve(results.length === 0 ? null : tracks);
                }
            });
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
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO lyrics (Artist,Title,Site,Lyrics) " +
            'VALUES("' + track.artist + '", "' + track.title + '", "' + track.site + '", ' + formatLyrics(lyrics) + ')';
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results);
            });
    });
}

function formatLyrics(lyrics: string) {
    return p(lyrics == null ? null : lyrics.replace(/"/g, '\\"'));
}

function p(value: string) {
    return value == null ? "NULL" : '"' + value.replace("&", "\&").trim() + '"';
}

function updateInternal(track: Track) {
    return new Promise((resolve, reject) => {
        let query = "UPDATE lyrics " +
            'SET Site=' + p(track.site) + ', Lyrics=' + formatLyrics(track.lyrics) + ' ' +
            'WHERE Artist=' + p(track.artist) + ' AND Title=' + p(track.title);
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results);
            });
    });
}

export async function update(track: Track) {
    var result = await queryTrack(track);
    if (result == null) insert(track, track.lyrics);
    else updateInternal(track);
}

export function remove(track: Track) {
    return new Promise((resolve, reject) => {
        let query = "DELETE FROM lyrics " +
            'WHERE Artist=' + p(track.artist) + ' AND Title=' + p(track.title);
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results);
            });
    });
}