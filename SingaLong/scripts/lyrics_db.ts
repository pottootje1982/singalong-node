import { Track } from './Track';

var knex = null;
var table = 'lyrics';

function createConnection() {
    try {
        knex = require('knex')({
            client: 'mysql',
            connection: {
                host: '87.195.169.201',
                port: 3307,
                user: 'pottootje1982',
                password: 'Icf5uEiPRtjXD7GK',
                database: 'singalong'
            },
            useNullAsDefault: true
        });
    } catch (err) {
        console.log('Failed establishing DB connection ' + err);
    }
}

export function setTable(tableName: string) {
    table = tableName;
}

createConnection();

function whereArtistTitle(artist: string, title: string) {
    var query = knex(table).where('title', 'like', title);
    if (artist != null) query.andWhere('artist', artist);
    return query;
}

export async function query(artist: string, title: string, id?: string): Promise<Track[]> {
    if (title === '' || title == null) return null;
    var query = whereArtistTitle(artist, title);
    if (id != null) query = query.orWhere('id', id);
    var results = await query;
    var tracks = [];
    for (let result of results)
        tracks.push(new Track(result.Artist, result.Title, result.Site, result.Lyrics));
    return results.length === 0 ? null : tracks;
}

export async function queryTrack(track: Track): Promise<Track> {
    try {
        var tracks = await query(null, track.getQueryTitle(), track.id);
        if (tracks == null && track.canClean()) tracks = await query(track.cleanArtist(), track.cleanTitle());
        if (tracks == null) return null;
        var result: Track;
        if (tracks.length === 1) result = tracks[0];
        else {
            var filteredTracks = tracks.filter(t => t.artist.toUpperCase() === track.artist.toUpperCase() &&
                t.title.toUpperCase() === track.title.toUpperCase());
            result = filteredTracks.length === 0 ? tracks[0] : filteredTracks[0];
        }
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function queryPlaylist(playlist: Track[], notDownloaded: boolean): Promise<Track[]> {
    var query = knex(table);
    for (let track of playlist) {
        query = query.orWhere('title', 'like', track.getQueryTitle());
        if (track.id) query = query.orWhere('id', track.id);
    }
    let queryResults: any[] = await query;
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

export function insert(track: Track, lyrics: string) {
    let query = knex(table).insert({
        artist: track.artist,
        title: track.title,
        site: track.site || null,
        lyrics: lyrics,
        id: track.id || null
    });
    return query;
}

export function updateId(track: Track) {
    var query = whereArtistTitle(track.artist, track.getQueryTitle());
    if (track.id) query = query.update('id', track.id);
    return query;
}

export function update(track: Track, lyrics: string) {
    var query = whereArtistTitle(track.artist, track.getQueryTitle());
    query = query.update('lyrics', lyrics);
    return query;
}

export async function updateOrInsert(track: Track, lyrics: string) {
    var result = await queryTrack(track);
    if (result == null) await insert(track, lyrics);
    else await update(result, lyrics);
}

export async function remove(track: Track) {
    var foundTrack = await queryTrack(track);
    if (foundTrack) {
        await knex(table).where({
            artist: track.artist,
            title: track.title
        }).del();
    }
}

export function truncate() {
    return knex(table).truncate();
}