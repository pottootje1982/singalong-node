import { Track, simpleTrack } from '../client/src/track'
import createDb from './db/mongo-client'
import LyricsTable from './db/table/lyrics'
import LyricsDb from './lyrics_db'

describe('Lyrics DB', () => {
  let lyricsDb

  function insertTrack(artist, title, lyrics, id?) {
    return lyricsDb.insert(new Track({ artist, title, id }), lyrics)
  }

  function trackWithId(id, artist, title) {
    return new Track({ id, artist, title })
  }

  beforeAll(async () => {
    const client = await createDb(global.__MONGO_URI__)
    const table = new LyricsTable(client)
    lyricsDb = new LyricsDb(table)
  })

  beforeEach(async () => {
    await lyricsDb.lyricsTable.deleteAll()
  })

  afterAll(async () => {
    await lyricsDb.close()
  })

  it('Insert and get Beatles lyrics', async () => {
    await insertTrack(
      'The Beatles',
      'Yellow Submarine',
      'In the town where I was born',
      '1234'
    )
    var tracks = await lyricsDb.query('The Beatles', 'Yellow Submarine')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')
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

    expect(tracks[0].artist).toEqual('The Beatles 2')
    expect(tracks[0].id).toEqual('5678')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')

    tracks = await lyricsDb.query('The Beatles', 'Submarine', '1234')
    expect(tracks[0].artist).toEqual('The Beatles')
    expect(tracks[0].id).toEqual('1234')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')
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
    expect(track.lyrics).toEqual('Chestnuts roasting on an open fire')
    var track = await lyricsDb.queryTrack(
      simpleTrack('Nat King Cole', 'Christmas Song')
    )
    expect(track.lyrics).toEqual("Nat King Cole's version")
  })

  it('Get lyrics for title track', async () => {
    await insertTrack(
      'Frommerman',
      'Es ist ein Ros entsprungen',
      "Es ist ein Ros' entsprungen",
      '3'
    )
    var track = await lyricsDb.queryTrack(
      trackWithId('3', '', 'Es ist ein Ros entsprungen')
    )
    expect(track.lyrics).toEqual("Es ist ein Ros' entsprungen")
  })

  it('Search for empty title', async () => {
    const track = await lyricsDb.queryTrack(simpleTrack('Beatles', ''))
    expect(track).toBeNull()
  })

  it('Get unexisting lyrics', async () => {
    const tracks = await lyricsDb.query(
      'Freddy Kruger',
      'Nightmare on Elm Street'
    )
    expect(tracks).toBeNull()
  })

  it('Query unexisting playlist pushAllTracks', async () => {
    const playlist = await lyricsDb.queryPlaylist([
      simpleTrack('Freddy Kruger', 'Nightmare on Elm Street'),
    ])
    expect(playlist.length).toBe(1)
    expect(playlist[0].artist).toEqual('Freddy Kruger')
    expect(playlist[0].title).toEqual('Nightmare on Elm Street')
    expect(playlist[0].lyrics).toBeUndefined()
  })

  it('Query playlist notDownloaded', async () => {
    await insertTrack(
      'Beatles',
      'Let t be',
      'Desmond has a barrow in the market place'
    )
    const playlist = await lyricsDb.queryPlaylist(
      [
        simpleTrack('Freddy Kruger', 'Nightmare on Elm Street'),
        simpleTrack('Beatles', 'Let t be'),
      ],
      false
    )
    expect(playlist.length).toBe(1)
    expect(playlist[0].artist).toEqual('Freddy Kruger')
    expect(playlist[0].title).toEqual('Nightmare on Elm Street')
    expect(playlist[0].lyrics).toBeUndefined()
  })

  it('escape special chars artistTitleQuery', () => {
    const query = lyricsDb.artistTitleQuery(
      'Pink Floyd',
      'Shine On You Crazy Diamond (Parts 1'
    )
    expect(query).toEqual({
      title: /Shine\ On\ You\ Crazy\ Diamond\ \(Parts\ 1/i,
      artist: /Pink\ Floyd/i,
    })
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
    expect(playlist.length).toBe(5)
    expect(playlist[4].artist).toEqual('John Lennon')
    expect(playlist[4].title).toBe('Imagine')
    expect(
      playlist.some((track) => track.title === '' || track.title == null)
    ).toBeFalsy()
    expect(playlist[4].lyrics).toBe("Imagine there's no heaven")
  })

  it('Remove lyrics', async function () {
    let track: any = simpleTrack('fake artist', 'fake title', 'MusixMatch')
    await lyricsDb.insert(track, 'fake lyrics')
    track = await lyricsDb.queryTrack(track)
    expect(track.artist).toEqual('fake artist')
    expect(track.title).toEqual('fake title')
    expect(track.lyrics).toEqual('fake lyrics')
    await lyricsDb.remove(track)
    track = await lyricsDb.queryTrack(track)
    expect(track).toBeNull()
  })

  it('Update existing lyrics', async function () {
    await insertTrack('Calexico', 'Sunken Waltz', '', 1)
    let track: any = await lyricsDb.queryTrack(
      simpleTrack('Calexico', 'Sunken Waltz')
    )
    expect(track.lyrics).toEqual('')
    await lyricsDb.updateOrInsert(
      track,
      'Washed my face in the rivers of empire'
    )

    track = await lyricsDb.queryTrack(simpleTrack('Calexico', 'Sunken Waltz'))
    expect(track.lyrics).toEqual('Washed my face in the rivers of empire')

    const tracks = await lyricsDb.lyricsTable.find({ artist: 'Calexico' })
    expect(tracks.length).toBe(1)
  })
})
