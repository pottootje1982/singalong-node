var mysql = require('mysql');
import { Track } from './Track';

var connection = null;

function createConnection() {
    try {
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
    } catch (err) {
        console.log('Failed establishing DB connection ' + err);
    }
}

createConnection();

// Default wait time out is 28800 seconds (8 hours), that's why we ping each hour the DB connection to avoid connection reset

setInterval(() => {
    executeQuery("SELECT 1", results => {
        console.log('Executed Database heartbeat');
        return results;
    });
}, 1000 * 3600);

export function executeQuery(query : string, processResults = null) : Promise<any[]> {
    return new Promise((resolve, reject) => {
        try {
            connection.query(query,
                (error, results, fields) => {
                    if (error) {
                        if (error.code === 'ECONNRESET') { // Reestablish connection in case of connection reset
                            console.log("Re-establishing connection");
                            createConnection();
                        }
                        reject(Error(error));
                    } else resolve(processResults != null ? processResults(results) : results);
                });
        } catch (error) {
            console.log("Failed executing query " + query, error);
        }
    });
}

export function query(artist: string, title: string, id?: string): Promise<Track[]> {
    if (title === '' || title == null) return null;
    var artistPart = artist != null ? 'Artist' + p(artist) + ' AND ' : '';
    var idPart = id != null ? ' OR Id=' + p(id, false) : '';
    var query = 'SELECT * FROM lyrics WHERE ' + artistPart + 'Title' + p(title) + idPart;
    return executeQuery(query,
        results => {
            var tracks = [];
            for (let result of results)
                tracks.push(new Track(result.Artist, result.Title, result.Site, result.Lyrics));
            return results.length === 0 ? null : tracks;
        });
}

export async function queryTrack(track: Track): Promise<Track> {
    try {
        var tracks = await query(null, track.getMinimalTitle(), track.id);
        if (tracks == null && track.canClean()) tracks = await query(track.cleanArtist(), track.cleanTitle());
        if (tracks == null) return null;
        var result: Track;
        if (tracks.length === 1) result = tracks[0];
        else {
            var filteredTracks = tracks.filter(t => t.artist.toUpperCase() === track.artist.toUpperCase() &&
                t.title.toUpperCase() === track.title.toUpperCase());
            result = filteredTracks.length === 0 ? tracks[0] : filteredTracks[0];
        }
        result.id = track.id;
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function queryPlaylist(playlist: Track[], notDownloaded: boolean): Promise<Track[]> {
    var titles = playlist.map(track => 'Title' + p(track.getMinimalTitle()) + ' OR Id=' + p(track.id, false));
    var wherePart = titles.join(' OR ');
    var query = 'SELECT * FROM lyrics WHERE ' + wherePart;
    let queryResults: any[] = await executeQuery(query);
    var results: Track[] = [];
    for (let track of playlist) {
        var matches = queryResults.filter(match => match.Title.toUpperCase().includes(track.getMinimalTitle().toUpperCase()) || match.Id === track.id);
        if (matches.length === 0) {
            results.push(track);
            continue;
        }
        if (notDownloaded) continue;
        var exactMatch = matches[0];
        if (matches.length > 1) {
            exactMatch = matches.find(match => match.Title.toUpperCase() === track.title.toUpperCase() &&
                match.Artist.toUpperCase() === track.artist.toUpperCase()) || exactMatch;
        }
        track.lyrics = exactMatch.Lyrics;
        results.push(track);
    }
    return results;
}

function invoke(functionName: string, ...params: string[]) {
    return functionName + '(' + params.map(arg => JSON.stringify(arg)).join(', ') + ')';
}

export function insert(track: Track, lyrics: string) {
    let query = "INSERT INTO lyrics (Artist,Title,Site,Lyrics,Id) " +
        invoke('VALUES', track.artist, track.title, track.site, clean(lyrics), p(track.id, false));
    return executeQuery(query);
}

function clean(lyrics: string) {
    return p(lyrics == null ? null : lyrics, false);
}

function p(value: string, like: boolean = true) {
    if (value == null) return 'NULL';
    value = value.replace(/&/g, "\&").replace(/"/g, '\\"').trim();
    value = like ? ' LIKE "%' + value + '%"' : '"' + value + '"';
    return value;
}

function updateInternal(track: Track, lyrics: string) {
    let query = "UPDATE lyrics " +
        'SET Site=' + clean(track.site) + ', Lyrics=' + clean(lyrics) + ', Id=' + p(track.id, false) +
        ' WHERE Artist' + p(track.artist) + ' AND Title' + p(track.title);
    return executeQuery(query);
}

export async function update(track: Track, lyrics: string) {
    var result = await queryTrack(track);
    if (result == null) insert(track, lyrics);
    else updateInternal(result, lyrics);
}

export async function remove(track: Track) {
    var foundTrack = await queryTrack(track);
    if (foundTrack) {
        let query = "DELETE FROM lyrics " + 'WHERE Artist' + p(foundTrack.artist) + ' AND Title' + p(foundTrack.title);
        return executeQuery(query);
    }
}