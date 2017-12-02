export class Track {
    artist: string;
    title: string;

    constructor(artist: string, title: string, site?: string, lyrics?: string) {
        this.artist = artist;
        this.title = title;
        this.site = site;
        this.lyrics = lyrics;
    }

    site: string;
    lyrics: string;
}