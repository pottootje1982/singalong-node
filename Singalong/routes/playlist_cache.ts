import {Track} from "../scripts/track";
import { Playlist } from '../scripts/Playlist';

export class PlaylistCache {
    playlistId : string;
    userId: string;
    playlist: Playlist;

    constructor(playlist: Playlist) {
        this.playlist = playlist;
        this.userId = playlist.userId;
        this.playlistId = playlist.getId();
    }
}

var playlists: PlaylistCache[] = [];

export function store(playlist: Playlist) {
    this.remove(playlist.userId, playlist.getId());
    playlists.push(new PlaylistCache(playlist));
}

export function get(userId: string, playlistId: string): Playlist {
    userId = userId === '' ? null : userId;
    let entry = playlists.find(entry => entry.userId === userId && entry.playlistId === playlistId);
    return entry != null ? entry.playlist : null;
}

export function remove(userId: string, playlistId: string) {
    var playlist = this.get(userId, playlistId);
    var index = playlists.indexOf(playlist);
    if (index > -1)
        playlists.splice(index, 1);
}
