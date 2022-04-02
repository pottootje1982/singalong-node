import { LyricsSearchEngine } from './LyricsSearchEngine'
import cheerio = require('cheerio')

export class ChartLyricsEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'Title'
  }

  constructor() {
    super(
      'ChartLyrics',
      { domain: 'http://api.chartlyrics.com', lyricsLocation: 'Lyric' }
    )
  }

  public searchLyrics(artist: string, title: string) {
    const downloadUrl = `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=${this.encode(artist)}&song=${this.encode(title)}`
    return this.downloadUrl(downloadUrl)
  }
}
