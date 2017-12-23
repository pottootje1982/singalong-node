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

    getTitlePlaylist() {
        return Playlist.getTitlePlaylist(this.items);
    }

    getMinimalTitlePlaylist() {
        return Playlist.getMinimalTitlePlaylist(this.items);
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
        if (textualPlaylist == null) return new Playlist(null, null, null, null, []);
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