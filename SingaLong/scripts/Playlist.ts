import { Track } from '../scripts/Track';

export class Playlist {
    userId: string;
    playlistId: string;
    albumId: string;

    name: string;
    items: Track[];

    totalCount: number;

    constructor(userId: string, playlistId: string, albumId: string, name, playlist: Track[], totalCount: number = 0) {
        this.userId = userId;
        this.playlistId = playlistId;
        this.albumId = albumId;
        this.name = name;
        this.items = playlist;
        this.totalCount = totalCount;
    }

    getNextTrackWithLyrics(id: string, next: boolean): any {
        var currentTrack = this.items.find(track => track.id === id);
        var index = this.items.indexOf(currentTrack);
        if (index === -1) return null;
        var offset = next ? +1 : -1;
        var init = next ? offset : this.items.length - 1;
        var end = next ? this.items.length - 1 : offset;
        var track: Track;
        for (var i = init; i != end; i = i + offset) {
            var corrected = (i + this.items.length + index) % this.items.length;
            track = this.items[corrected];
            if (track.lyrics != null) {
                return track;
            }
        }
    }

    getNextTrack(id: string, next: boolean): any {
        var currentTrack = this.items.find(track => track.id === id);
        var index = this.items.indexOf(currentTrack);
        var offset = next ? +1 : -1;
        var nextIndex = (index + this.items.length + offset) % this.items.length;
        return this.items[nextIndex];
    }

    getId() {
        return this.albumId || this.playlistId;
    }

    getContext() {
        return { userId: this.userId, playlistId: this.playlistId, albumId: this.albumId };
    }

    getTitlePlaylist() {
        return Playlist.getTitlePlaylist(this.items);
    }

    getMinimalTitlePlaylist() {
        return Playlist.getMinimalTitlePlaylist(this.items);
    }

    static Empty() {
        return new Playlist(null, null, null, null, []);
    }

    static getTitlePlaylist(playlist: Track[]) {
        var textualPlaylist = '';
        for (let track of playlist) {
            textualPlaylist += track.title + '\n';
        }
        return textualPlaylist;
    }

    static getMinimalTitlePlaylist(playlist: Track[]) {
        var textualPlaylist = '';
        for (let track of playlist) {
            textualPlaylist += track.toString(true) + '\n';
        }
        return textualPlaylist;
    }

    static textualPlaylistToPlaylist(textualPlaylist: string, noArtist: boolean = false) : Playlist {
        var textualTracks = textualPlaylist.trim().split('\n');
        var tracks = [];
        for (let trackString of textualTracks) {
            var track = noArtist ? new Track(null, trackString) : Track.parse(trackString);
            if (track != null)
                tracks.push(track);
        }
        return new Playlist(null, null, null, null, tracks);
    }
}