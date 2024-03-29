﻿import { LyricsSearchEngine } from './LyricsSearchEngine'

export class MusixMatchEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return '.title'
  }

  constructor() {
    super(
      'MusixMatch',
      { domain: 'https://www.musixmatch.com', searchQuery: 'https://www.musixmatch.com/search/', lyricsLocation: '.mxm-lyrics>span,p' })
  }

  protected replaceInLyrics($) {
    var lyrics = super.replaceInLyrics($)
    if ($('.mxm-lyrics-not-available').length > 0) return null
    return lyrics.slice(0, 1)
  }
}
