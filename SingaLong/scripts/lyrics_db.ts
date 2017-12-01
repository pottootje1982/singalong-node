var mysql = require('mysql');

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
        connection.query('SELECT * FROM lyrics WHERE Artist LIKE "' + artist + '" AND Title LIKE "' + title + '"',
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results.length === 0 ? null : results[0]);
            });
    });
}

export function insert(artist, title, siteName, lyrics) {
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO lyrics (Artist,Title,Site,Lyrics) " +
            'VALUES("' + artist + '", "' + title + '", "' + siteName + '", "' + lyrics + '")';
        connection.query(query,
            (error, results, fields) => {
                if (error) reject(Error(error));
                else resolve(results);
            });
    });
}