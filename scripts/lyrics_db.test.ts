import LyricsDb from './lyrics_db'
var assert = require('assert')
import { Track, simpleTrack } from '../client/src/track'
const createTable = require('./db/tables')

describe('Lyrics DB', () => {
  let lyricsDb: LyricsDb

  function insertTrack(artist, title, lyrics, id?) {
    return lyricsDb.insert(new Track({ artist, title, id }), lyrics)
  }

  function trackWithId(id, artist, title) {
    return new Track({ id, artist, title })
  }

  beforeEach(async () => {
    const { lyricTable } = await createTable('./mongo-client', 'testLyrics')
    lyricsDb = new LyricsDb(lyricTable)
    await lyricsDb.removeAll()
  })

  it('Insert and get Beatles lyrics', async () => {
    await insertTrack(
      'The Beatles',
      'Yellow Submarine',
      'In the town where I was born',
      '1234'
    )
    var tracks = await lyricsDb.query('The Beatles', 'Yellow Submarine')
    assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0)
  })

  it('Get Beatles lyrics like', async () => {
    await insertTrack(
      'The Beatles',
      'Yellow Submarine',
      'In the town where I was born',
      '1234'
    )
    await insertTrack(
      'The Beatles 2',
      'Yellow Submarine',
      'In the town where I was born',
      '5678'
    )

    var tracks = await lyricsDb.query('The Beatles 2', 'Submarine')

    assert.equal(tracks[0].artist, 'The Beatles 2')
    assert.equal(tracks[0].id, '5678')
    assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0)

    tracks = await lyricsDb.query('The Beatles', 'Submarine', '1234')
    assert.equal(tracks[0].artist, 'The Beatles')
    assert.equal(tracks[0].id, '1234')
    assert(tracks[0].lyrics.indexOf('In the town where I was born') >= 0)
  })

  it('Matches on id', async () => {
    await insertTrack(
      '',
      'Christmas Song',
      'Chestnuts roasting on an open fire',
      '1'
    )
    await insertTrack(
      'Nat King Cole',
      'Christmas Song',
      "Nat King Cole's version",
      '2'
    )
    var track = await lyricsDb.queryTrack(
      trackWithId('1', 'Nils Landgren', 'Christmas Song')
    )
    assert(track.lyrics.indexOf('Chestnuts roasting on an open fire') >= 0)
    var track = await lyricsDb.queryTrack(
      simpleTrack('Nat King Cole', 'Christmas Song')
    )
    assert(track.lyrics.indexOf("Nat King Cole's version") >= 0)
  })

  it('Get lyrics for title track', async () => {
    await insertTrack(
      'Frommerman',
      'Es ist ein Ros entsprungen',
      "Es ist ein Ros' entsprungen",
      '1'
    )
    var track = await lyricsDb.queryTrack(
      trackWithId('1', '', 'Es ist ein Ros entsprungen')
    )
    assert(track.lyrics.indexOf("Es ist ein Ros' entsprungen") >= 0)
  })

  it('Search for empty title', async () => {
    var track = await lyricsDb.queryTrack(simpleTrack('Beatles', ''))
    assert.equal(track, null)
  })

  it('Get unexisting lyrics', async () => {
    var tracks = await lyricsDb.query(
      'Freddy Kruger',
      'Nightmare on Elm Street'
    )
    assert.equal(tracks, null)
  })

  it('Query unexisting playlist pushAllTracks', async () => {
    var playlist = await lyricsDb.queryPlaylist([
      simpleTrack('Freddy Kruger', 'Nightmare on Elm Street'),
    ])
    assert.equal(1, playlist.length)
    assert.equal(playlist[0].artist, 'Freddy Kruger')
    assert.equal(playlist[0].title, 'Nightmare on Elm Street')
    assert.equal(playlist[0].lyrics, null)
  })

  it('Query playlist notDownloaded', async () => {
    await insertTrack(
      'Beatles',
      'Let t be',
      'Desmond has a barrow in the market place'
    )
    var playlist = await lyricsDb.queryPlaylist(
      [
        simpleTrack('Freddy Kruger', 'Nightmare on Elm Street'),
        simpleTrack('Beatles', 'Let t be'),
      ],
      false
    )
    assert.equal(playlist.length, 1)
    assert.equal(playlist[0].artist, 'Freddy Kruger')
    assert.equal(playlist[0].title, 'Nightmare on Elm Street')
    assert.equal(playlist[0].lyrics, null)
  })

  it('Query playlist', async () => {
    await insertTrack('Ray Charles', 'Georgia On My Mind', 'Georgia, Georgia')
    await insertTrack(
      'Cesare Valletti',
      'Dein Angesicht',
      'Dein Angesicht so lieb und schön,'
    )
    await insertTrack(
      'Jenny Arean & Frans Halsema',
      'Vluchten Kan Niet Meer',
      "Vluchten kan niet meer, 'k zou niet weten hoe"
    )
    await insertTrack(
      'Simone Kleinsma & Robert Long',
      'Vanmorgen Vloog Ze Nog',
      'Vanmorgen vloog ze nog'
    )
    await insertTrack('', 'Imagine', 'Version without artist')
    await insertTrack('John Lennon', 'Imagine', "Imagine there's no heaven")
    var playlist = await lyricsDb.queryPlaylist([
      simpleTrack('Ray Charles', 'Georgia On My Mind'),
      simpleTrack('Cesare Valletti', 'Dein Angesicht'),
      simpleTrack('Jenny Arean & Frans Halsema', 'Vluchten Kan Niet Meer'),
      simpleTrack('Simone Kleinsma & Robert Long', 'Vanmorgen Vloog Ze Nog'),
      simpleTrack('John Lennon', 'Imagine'),
    ])
    // There is an entry present in DB with Artist = 'John Lennon' AND Title = 'Imagine',
    // and one with Artist = '' AND Title = 'Imagine',
    // We only want the result with the Artist field present
    assert.equal(5, playlist.length)
    assert.equal(playlist[4].artist, 'John Lennon')
    assert.equal(playlist[4].title, 'Imagine')
    assert.equal(
      null,
      playlist.find((track) => track.title === '' || track.title == null)
    )
    assert(playlist[4].lyrics.indexOf("Imagine there's no heaven") >= 0)
  })

  it('Remove lyrics', async function () {
    let track = simpleTrack('fake artist', 'fake title', 'MusixMatch')
    await lyricsDb.insert(track, 'fake lyrics')
    track = await lyricsDb.queryTrack(track)
    assert.equal('fake artist', track.artist)
    assert.equal('fake title', track.title)
    assert.equal('fake lyrics', track.lyrics)
    await lyricsDb.remove(track)
    track = await lyricsDb.queryTrack(track)
    assert.equal(track, null)
  })

  it('Update John Lennon lyrics', async function () {
    await insertTrack('Calexico', 'Sunken Waltz', '')
    var track = await lyricsDb.queryTrack(
      simpleTrack('Calexico', 'Sunken Waltz')
    )
    assert.equal('', track.lyrics)
    var res,
      error = await lyricsDb.updateOrInsert(
        track,
        'Washed my face in the rivers of empire'
      )
    assert.equal(error, null)
    track = await lyricsDb.queryTrack(simpleTrack('Calexico', 'Sunken Waltz'))
    assert.equal('Washed my face in the rivers of empire', track.lyrics)
  })
})
