export class Track {
    artist: string;
    title: string;

    constructor(artist: string, title: string, site?: string, lyrics?: string) {
        this.artist = artist.trim();
        this.title = title.trim();
        this.site = site;
        this.lyrics = lyrics;
    }

    public toString(): string {
        if (this.artist == null || this.artist === '')
            return this.title;
        return this.artist + ' - ' + this.title;
    }

    public static parse(track: string): Track {
        var trackItems = track.split('-', 2);
        trackItems = trackItems.map(track => track.trim());
        if (trackItems.length < 1) return null;
        let artist = trackItems[0].trim();
        let title = trackItems.length >= 2 ? trackItems[1] : '';
        return new Track(artist, title);
    }

    site: string;
    lyrics: string;

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
}