import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class AzLyricsEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'a[href*="https://www.azlyrics.com"]';
  }

  constructor() {
    super("AzLyrics", {
      domain: "https://www.azlyrics.com",
      searchQuery: "https://search.azlyrics.com/search.php?q=",
      lyricsLocation: ".row>div>div:not([class])",
    });
  }
}
