import { Track } from '../scripts/Track';

export class Playlist {
    name: string;
    items: Track[];

    constructor(name, playlist: Track[]) {
        this.name = name;
        this.items = playlist;
    }
}