﻿var mysql = require('mysql');
import { Track } from './Track';

var connection = mysql.createConnection({
    host: '192.168.178.65',
    port: 3307,
    user: 'pottootje1982',
    password: 'Icf5uEiPRtjXD7GK',
    database: 'singalong'
});

connection.connect();

export function query(artist, title) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM lyrics WHERE Artist LIKE ' + p(artist) + ' AND Title LIKE ' + p(title);
        console.log('Executing query: ' + query);
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results.length === 0 ? null : results[0]);
            });
    });
}

export function insert(artist, title, siteName, lyrics) {
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO lyrics (Artist,Title,Site,Lyrics) " +
            'VALUES("' + artist + '", "' + title + '", "' + siteName + '", ' + formatLyrics(lyrics) + ')';
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
    return value == null ? "NULL" : '"' + value.trim() + '"';
}

export function update(track: Track) {
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