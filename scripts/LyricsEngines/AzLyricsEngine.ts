import { LyricsSearchEngine } from "./LyricsSearchEngine"

export class AzLyricsEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'a[href*="https://www.azlyrics.com"]'
  }

  constructor() {
    super(
      "AzLyrics",
      "https://www.azlyrics.com",
      "https://search.azlyrics.com/search.php?q=",
      ".row>div>div:not([class])"
    )
  }
}
