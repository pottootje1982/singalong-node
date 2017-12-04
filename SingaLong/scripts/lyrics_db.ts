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

export function query(artist, title) {
    return new Promise((resolve, reject) => {
        if (artist === '' || artist == null || title === '' || title == null) resolve(null);
        let query = 'SELECT * FROM lyrics WHERE Artist LIKE ' + p(artist) + ' AND Title LIKE ' + p(title);
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results.length === 0 ? null : results[0]);
            });
    });
}

export async function queryTrack(track: Track) {
    var result = await query(track.artist, track.title);
    if (result == null && track.canClean()) result = await query(track.cleanArtist(), track.cleanTitle());
    return result;
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