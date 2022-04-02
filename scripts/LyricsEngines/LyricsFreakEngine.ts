import { LyricsSearchEngine } from './LyricsSearchEngine'

export class LyricsFreakEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'a[href*="https://www.lyricsfreak.com"]'
  }

  constructor() {
    super(
      'LyricsFreak',
      { domain: 'http://www.lyricsfreak.com', searchQuery: 'https://www.google.nl/search?q=lyricsfreak.com+', lyricsLocation: '#content', textReplacements: [[/\n\n/g, '\n']] })
  }

  protected getAttribute(hit) {
    return super.getQueryAttribute(hit)
  }

  protected replaceInLyrics($) {
    var lyrics = super.replaceInLyrics($)
    if (lyrics.length === 0) return null
    for (var child of lyrics[0].children.filter(
      (child) => child.type === 'tag'
    )) {
      child.type = 'text'
      child.data = '\n'
    }
    return lyrics
  }
}
