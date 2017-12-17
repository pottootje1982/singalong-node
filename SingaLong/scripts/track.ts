export class Track {
    id: string;
    artist: string;
    title: string;
    site: string;
    lyrics: string;
    fullTrackTitle: string;

    constructor(artist: string, title: string, site?: string, lyrics?: string, fullTrackTitle?: string, id?: string, ) {
        this.artist = artist.trim();
        this.title = title.trim();
        this.site = site;
        this.lyrics = lyrics;
        this.fullTrackTitle = fullTrackTitle;
        this.id = id;
    }

    public toString(): string {
        if (this.fullTrackTitle != null) return this.fullTrackTitle;
        if (this.artist == null || this.artist === '')
            return this.title;
        return this.artist + ' - ' + this.title;
    }

    public static parse(trackStr: string): Track {
        var trackItems = trackStr.split('-', 2);
        trackItems = trackItems.map(track => track.trim());
        if (trackItems.length < 1) return null;
        let artist = trackItems.length === 1? '' : trackItems[0].trim();
        let title = trackItems.length === 1 ? trackItems[0] : trackItems[1];
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
}