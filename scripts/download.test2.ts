const assert = require('assert')
import LyricsDownloader from './download'
import { MusixMatchEngine } from './LyricsEngines/MusixMatchEngine'
import { Track, simpleTrack } from '../client/src/track'
import { MetroLyricsEngine } from './LyricsEngines/MetroLyricsEngine'
const createDb = require('./db/mongo-client')
const LyricsTable = require('./db/table/lyrics')

import LyricsDb from './lyrics_db'

describe('Downloading lyrics', () => {
  let lyricsDb: LyricsDb
  let lyricsDownloader: LyricsDownloader
  let engine: MusixMatchEngine

  function insertTrack(artist, title, lyrics, site?: string) {
    return lyricsDb.insert(new Track({ artist, title, site }), lyrics)
  }

  beforeEach(async () => {
    engine = new MusixMatchEngine()
    const client = await createDb(global.__MONGO_URI__)
    const table = new LyricsTable(client)
    lyricsDb = new LyricsDb(table)
    lyricsDownloader = new LyricsDownloader(lyricsDb)
  })

  afterEach(async () => {
    await lyricsDb.close()
  })

  it('Search Euson - Leon', async () => {
    var content = await engine.searchLyrics('Euson', 'Leon')
    assert.equal(content, null)
  })

  it('Search Beatles MusixMatch', async () => {
    var content = await lyricsDownloader.engines['MusixMatch'].searchLyrics(
      'beatles',
      'yellow submarine'
    )
    assert(content.indexOf('In the town where I was born') >= 0, content)
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
    assert.equal(playlist[1].site, 'AzLyrics')

    assert(
      playlist[2].lyrics.indexOf("Imagine there's no heaven") >= 0,
      "Imagine there's no heaven wasn't found"
    )
    assert.equal(playlist[2].site, 'MusixMatch')
  })
})
