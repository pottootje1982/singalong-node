import {Track} from "../scripts/track";
import { Playlist } from '../scripts/Playlist';

export class PlaylistCache {
    playlistId : string;
    userId: string;
    playlist: Playlist;

    constructor(userId: string, playlistId: string, playlist: Playlist) {
        this.userId = userId;
        this.playlistId = playlistId;
        this.playlist = playlist;
    }
}

var playlists: PlaylistCache[] = [];

export function store(userId: string, playlistId: string, playlist: Playlist) {
    this.remove(userId, playlistId);
    playlists.push(new PlaylistCache(userId, playlistId, playlist));
}

export function get(userId: string, playlistId: string): Playlist {
    let entry = playlists.find(playlist => playlist.userId === userId && playlist.playlistId === playlistId);
    return entry != null ? entry.playlist : null;
}

export function remove(userId: string, playlistId: string) {
    var playlist = this.get(userId, playlistId);
    var index = playlists.indexOf(playlist);
    if (index > -1)
        playlists.splice(index, 1);
}
