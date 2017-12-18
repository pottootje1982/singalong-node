import {Track} from "../scripts/track";

export class PlaylistCache {
    playlistId : string;
    userId: string;
    playlist: Track[];

    constructor(userId: string, playlistId: string, playlist: Track[]) {
        this.userId = userId;
        this.playlistId = playlistId;
        this.playlist = playlist;
    }
}

var playlists: PlaylistCache[] = [];

export function store(userId: string, playlistId: string, playlist: Track[]) {
    this.remove(userId, playlistId);
    playlists.push(new PlaylistCache(userId, playlistId, playlist));
}

export function get(userId: string, playlistId: string) {
    return playlists.find(playlist => playlist.userId === userId && playlist.playlistId === playlistId);
}

export function remove(userId: string, playlistId: string) {
    var playlist = this.get(userId, playlistId);
    var index = playlists.indexOf(playlist);
    if (index > -1)
        playlists.splice(index, 1);
}
