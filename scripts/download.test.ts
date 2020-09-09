import assert = require('assert')
import LyricsDownloader from './download'
import { LyricsSearchEngine } from './LyricsEngines/LyricsSearchEngine'
import { Track, simpleTrack } from '../client/src/track'
import { MetroLyricsEngine } from './LyricsEngines/MetroLyricsEngine'

import LyricsDb from './lyrics_db'
const createTable = require('./db/tables')

describe('Downloading lyrics', () => {
  let lyricsDb: LyricsDb
  let lyricsDownloader: LyricsDownloader
  var engine: LyricsSearchEngine

  function insertTrack(artist, title, lyrics, site?: string) {
    return lyricsDb.insert(new Track({ artist, title, site }), lyrics)
  }

  before(async () => {
    const { lyricTable } = await createTable('./mongo-client', 'testLyrics')
    lyricsDb = new LyricsDb(lyricTable)
    await lyricsDb.removeAll()
    lyricsDownloader = new LyricsDownloader(lyricsDb)
    engine = lyricsDownloader.engines['MusixMatch']
  })

  it('Search Euson - Leon', async () => {
    var content = await engine.searchLyrics('Euson', 'Leon')
    assert.equal(content, null)
  })

  it('Search Beatles Genius', async function () {
    this.timeout(5000)
    var content = await lyricsDownloader.engines['Genius'].searchLyrics(
      'beatles',
      'yellow submarine'
    )
    assert(content.indexOf('In the town where I was born') >= 0, content)
  })

  it('Search Beatles MusixMatch', async () => {
    var content = await lyricsDownloader.engines['MusixMatch'].searchLyrics(
      'beatles',
      'yellow submarine'
    )
    assert(content.indexOf('In the town where I was born') >= 0, content)
  })

  it('Search Beatles AZ', async () => {
    var content = await lyricsDownloader.engines['AzLyrics'].searchLyrics(
      'beatles',
      'yellow submarine'
    )
    assert(content.indexOf('In the town where I was born') >= 0, content)
  })

  it('Search with LyricsFreak', async () => {
    var content = await lyricsDownloader.engines['LyricsFreak'].searchLyrics(
      'Bonnie Raitt',
      'Angel from Montgomery'
    )
    assert(content.indexOf('I am an old woman\n') > -1)
  })

  it('Search unexisting lyrics', async () => {
    var lyrics = await engine.searchLyrics('bladieblablabla', '')
    assert.equal(lyrics, null)
  })

  it('Search unexisting lyrics Genius', async () => {
    var lyrics = await lyricsDownloader.engines['Genius'].searchLyrics(
      'bladieblablabla',
      ''
    )
    assert.equal(lyrics, null)
  })

  it('Search unexisting lyrics Metro', async () => {
    var lyrics = await new MetroLyricsEngine().searchLyrics(
      'bladieblablabla',
      ''
    )
    assert.equal(lyrics, null)
  })

  it('Download track', async () => {
    var track = await lyricsDownloader.downloadTrack(
      simpleTrack('Beatles', 'Yellow Submarine')
    )
    assert(track.lyrics.indexOf('In the town where I was born') >= 0)
  })

  it('Get lyrics from database', async () => {
    await insertTrack(
      '1793 George Harrison',
      'Give Me Love (Give Me Peace On Earth)',
      'Give me love',
      'Genius'
    )
    await insertTrack(
      'John Lennon',
      'Imagine',
      "Imagine there's no heaven",
      'MusixMatch'
    )
    await insertTrack(
      'Beatles',
      'Yellow Submarine',
      'In the town where I was born',
      'MusixMatch'
    )
    let playlist = [
      simpleTrack(
        '1793 George Harrison',
        'Give Me Love (Give Me Peace On Earth)'
      ),
      simpleTrack('Beatles', 'Yellow Submarine'),
      simpleTrack('John Lennon', 'Imagine'),
      simpleTrack('bladieblablabla', ''),
    ]
    playlist = await lyricsDownloader.getLyricsFromDatabase(playlist, false)
    assert.equal(playlist.length, 3)
    assert(
      playlist[0].lyrics.indexOf('Give me love') >= 0,
      "Give me love wasn't found"
    )
    assert.equal('Genius', playlist[0].site)

    assert(
      playlist[1].lyrics.indexOf('In the town where I was born') >= 0,
      "Yellow submarine wasn't found"
    )
    assert.equal('MusixMatch', playlist[1].site)

    assert(
      playlist[2].lyrics.indexOf("Imagine there's no heaven") >= 0,
      "Imagine there's no heaven wasn't found"
    )
    assert.equal('MusixMatch', playlist[2].site)
  })
})
