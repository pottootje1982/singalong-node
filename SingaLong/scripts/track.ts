﻿export class Track {
    id: string;
    artist: string;
    title: string;
    site: string;
    lyrics: string;
    fullTrackTitle: string;

    constructor(artist: string, title: string, site?: string, lyrics?: string, fullTrackTitle?: string, id?: string, ) {
        this.artist = artist ? artist.trim() : '';
        this.title = title.trim();
        this.site = site;
        this.lyrics = lyrics;
        this.fullTrackTitle = fullTrackTitle;
        this.id = id;
    }

    public toString(minimal:boolean = false): string {
        if (this.fullTrackTitle != null && !minimal) return this.fullTrackTitle;
        let title = (minimal ? this.getMinimalTitle() : this.title);
        if (this.artist == null || this.artist === '')
            return title;
        return this.artist + ' - ' + title;
    }

    public static parse(trackStr: string): Track {
        var trackItems = trackStr.split(' - ');
        if (trackItems.length < 1) return null;
        let artist = trackItems.length === 1 ? '' : trackItems[0].trim();
        if (trackItems.length > 1) trackItems.splice(0, 1);
        let title = trackItems.join(' - ').trim();
        if (artist === '' && title === '') return null;
        let track = new Track(artist, title);
        track.fullTrackTitle = trackStr;
        return track;
    }

    private cleanString(str: string) {
        var regex = /\d*([^\(\)\[\]]*)/i;
        var result = str.match(regex);
        return result != null && result.length > 1 ? result[1].trim() : str;
    }

    cleanArtist() : string {
        return this.cleanString(this.artist);
    }

    cleanTitle() : string {
        return this.cleanString(this.title);
    }

    canClean() : boolean {
        return this.cleanArtist() !== this.artist || this.cleanTitle() !== this.title;
    }

    static copy(track) {
        return new Track(track.artist, track.title, track.site, track.lyrics, track.fullTrackTitle, track.id);
    }

    static fromSpotify(track) : Track {
        let artist = track.artists[0].name;
        let title = track.name;
        if (artist === '' && title === '') return null;
        let result = new Track(artist, title);
        result.id = track.id;
        return result;
    }

    static toTracks(playlist: any[]) {
        return playlist.map(track => Track.copy(track));
    }

    getMinimalTitle() {
        return this.title.split(' - ', 1)[0].trim();
    }
}