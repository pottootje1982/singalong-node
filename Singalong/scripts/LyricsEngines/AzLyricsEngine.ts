import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class AzLyricsEngine extends LyricsSearchEngine {
    getHit(i: number) {
        return i => 'tbody>tr:nth-child(' + i++ + ')>td>a';
    }

    constructor() {
        super('https://www.azlyrics.com', 'https://search.azlyrics.com/search.php?q=', '.row>div>div:not([class])');
    }
}