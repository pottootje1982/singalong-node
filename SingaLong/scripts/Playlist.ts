import { Track } from '../scripts/Track';

export class Playlist {
    userId: string;
    playlistId: string;
    albumId: string;

    name: string;
    items: Track[];

    constructor(userId: string, playlistId: string, albumId: string, name, playlist: Track[]) {
        this.userId = userId;
        this.playlistId = playlistId;
        this.albumId = albumId;
        this.name = name;
        this.items = playlist;
    }

    getId() {
        return this.albumId || this.playlistId;
    }

    getContext() {
        return { userId: this.userId, playlistId: this.playlistId, albumId: this.albumId };
    }
}