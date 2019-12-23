import { LyricsSearchEngine } from "./LyricsSearchEngine"

export class LyricsFreakEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'a[href*="https://www.lyricsfreak.com"]'
  }

  constructor() {
    super(
      "LyricsFreak",
      "http://www.lyricsfreak.com",
      "https://www.google.nl/search?q=lyricsfreak.com+",
      "#content"
    )
  }

  protected getAttribute(hit) {
    return super.getQueryAttribute(hit)
  }

  protected replaceInLyrics($) {
    var lyrics = super.replaceInLyrics($)
    if (lyrics.length === 0) return null
    for (var child of lyrics[0].children.filter(
      child => child.type === "tag"
    )) {
      child.type = "text"
      child.data = "\n"
    }
    return lyrics
  }
}
