import { LyricsSearchEngine } from './LyricsSearchEngine'
import cheerio = require('cheerio')

export class ChartLyricsEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return 'Title'
  }

  constructor() {
    super(
      'ChartLyrics',
      'http://api.chartlyrics.com',
      'http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect',
      '.mxm-lyrics>span,p'
    )
  }

  public async searchLyrics(artist: string, title: string) {
    const res = await this.request(
      `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=${this.encode(artist)}&song=${this.encode(title)}`
    )
    var $ = cheerio.load(res)
    return $('Lyric').text()
  }
}
