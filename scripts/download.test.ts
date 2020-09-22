const assert = require('assert')
import LyricsDownloader from './download'
import { Track, simpleTrack } from '../client/src/track'
import createDb from './db/mongo-client-fake'
import Table from './db/table/table'
import LyricsDb from './lyrics_db'
import {
  MusixMatchEngineMock,
  AzLyricsEngineMock,
  GeniusEngineMock,
  LyricsFreakEngineMock,
  MetroLyricsEngineMock,
} from './download.mock'

describe('Downloading lyrics', () => {
  let lyricsDb: LyricsDb
  let downloader: LyricsDownloader
  let musixMatchMock: MusixMatchEngineMock

  function insertTrack(artist, title, lyrics, site?: string) {
    return lyricsDb.insert(new Track({ artist, title, site }), lyrics)
  }

  beforeAll(async () => {
    musixMatchMock = new MusixMatchEngineMock()
    const client = await createDb()
    const table = new Table(client, 'downloaded-lyrics')
    lyricsDb = new LyricsDb(table)
  })

  beforeEach(async () => {
    await lyricsDb.lyricsTable.deleteAll()
    downloader = new LyricsDownloader(lyricsDb)
    downloader.engines = {
      AzLyrics: new AzLyricsEngineMock(),
      Genius: new GeniusEngineMock(),
      MusixMatch: new MusixMatchEngineMock(),
      LyricsFreak: new LyricsFreakEngineMock(),
    }
  })

  afterAll(async () => {
    await lyricsDb.close()
  })

  it('Search Euson - Leon', async () => {
    var content = await musixMatchMock.searchLyrics('Euson', 'Leon')
    assert.equal(content, null)
  })

  it('Search Beatles MusixMatch', async () => {
    var content = await musixMatchMock.searchLyrics(
      'beatles',
      'yellow submarine'
    )
    assert(content.indexOf('In the town where I was born') >= 0, content)
  })

  it('Search unexisting lyrics MusixMatch', async () => {
    var lyrics = await musixMatchMock.searchLyrics('blabla-musixmatch', '')
    assert.equal(lyrics, null)
  })

  it('Search unexisting lyrics Genius', async () => {
    const geniusMock = new GeniusEngineMock()
    var lyrics = await geniusMock.searchLyrics('blablabla-genius', '')
    assert.equal(lyrics, null)
  })

  it('Search unexisting lyrics Metro', async () => {
    const engine = new MetroLyricsEngineMock()
    var lyrics = await engine.searchLyrics('bladiebla-metrolyrics', '')
    assert.equal(lyrics, null)
  })

  it('Download track', async () => {
    var track = await downloader.downloadTrack(
      simpleTrack('The Beatles', 'A day in life')
    )
    expect(track.lyrics.substring(0, 21)).toEqual('I read the news today')
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
    playlist = await downloader.getLyricsFromDatabase(playlist, false)
    expect(playlist.length).toBe(3)
    expect(playlist[0].lyrics).toEqual('Give me love')
    expect('Genius').toEqual(playlist[0].site)

    expect(playlist[1].lyrics).toEqual('In the town where I was born')
    expect(playlist[1].site).toEqual('MusixMatch')

    expect(playlist[2].lyrics).toEqual("Imagine there's no heaven")
    expect(playlist[2].site).toEqual('MusixMatch')
  })
})
