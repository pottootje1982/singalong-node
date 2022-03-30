import { Track, simpleTrack } from '../../../client/src/track'
import LyricsTable from './lyrics'

describe('Lyrics DB', () => {
  let lyricsTab: LyricsTable

  function insertTrack(artist, title, lyrics, id?) {
    return lyricsTab.insert(new Track({ artist, title, id }), lyrics)
  }

  function trackWithId(id, artist, title) {
    return new Track({ id, artist, title })
  }

  beforeAll(async () => {
    lyricsTab = global.lyrics
  })

  it('Insert and get Beatles lyrics', async () => {
    var tracks = await lyricsTab.query('The Beatles', 'Yellow Submarine')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')
  })

  it('Get Beatles lyrics like', async () => {
    var tracks = await lyricsTab.query('The Beatles 2', 'Submarine')

    expect(tracks[0].artist).toEqual('The Beatles 2')
    expect(tracks[0].id).toEqual('5')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')

    tracks = await lyricsTab.query('The Beatles', 'Submarine', '1234')
    expect(tracks[0].artist).toEqual('The Beatles')
    expect(tracks[0].id).toEqual('4')
    expect(tracks[0].lyrics).toEqual('In the town where I was born')
  })

  it('Matches on id', async () => {
    var track = await lyricsTab.queryTrack(
      trackWithId('6', 'Nils Landgren', 'Christmas Song')
    )
    expect(track.lyrics).toEqual('Chestnuts roasting on an open fire')
    var track = await lyricsTab.queryTrack(
      simpleTrack('Nat King Cole', 'Christmas Song')
    )
    expect(track.lyrics).toEqual("Nat King Cole's version")
  })

  it('Get lyrics for title track', async () => {
    var track = await lyricsTab.queryTrack(
      trackWithId('8', '', 'Es ist ein Ros entsprungen')
    )
    expect(track.lyrics).toEqual("Es ist ein Ros' entsprungen")
  })

  it('Search for empty title', async () => {
    const track = await lyricsTab.queryTrack(simpleTrack('Beatles', ''))
    expect(track).toBeNull()
  })

  it('Get unexisting lyrics', async () => {
    const tracks = await lyricsTab.query(
      'Freddy Kruger',
      'Nightmare on Elm Street'
    )
    expect(tracks).toBeNull()
  })

  it('deletes track', async () => {
    let tracks = await lyricsTab.find()
    expect(tracks.length).toBe(11)
    await insertTrack(
      'Dire Straits',
      'News',
      '[Chorus]\nHe sticks to his guns',
      '4s6p0rVzSaWqaJRsp0HBDI'
    )
    const track = simpleTrack('dire Straits', 'News')
    tracks = await lyricsTab.find()
    expect(tracks.length).toBe(12)
    await lyricsTab.remove(track)
    tracks = await lyricsTab.find()
    expect(tracks.length).toBe(11)
  })

  it('Query unexisting playlist pushAllTracks', async () => {
    const playlist = await lyricsTab.queryPlaylist([
      simpleTrack('Freddy Kruger', 'Nightmare on Elm Street'),
    ])
    expect(playlist.length).toBe(1)
    expect(playlist[0].artist).toEqual('Freddy Kruger')
    expect(playlist[0].title).toEqual('Nightmare on Elm Street')
    expect(playlist[0].lyrics).toBeUndefined()
  })

  it('Query playlist notDownloaded', async () => {
    const playlist = await lyricsTab.queryPlaylist(
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
    const query = lyricsTab.artistTitleQuery(
      'Pink Floyd',
      'Shine On You Crazy Diamond (Parts 1'
    )
    expect(query).toEqual({
      title: /Shine\ On\ You\ Crazy\ Diamond\ \(Parts\ 1/i,
      artist: /Pink\ Floyd/i,
    })
  })

  it('Query playlist double artist', async () => {
    var playlist = await lyricsTab.queryPlaylist([
      simpleTrack('Yvonne Elliman', "I Don't Know How To Love Him"),
      simpleTrack('Zager & Evans', 'In the Year 2525 (Exordium & Terminus)'),
      simpleTrack('Zijlstra', 'Durgerdam Slaapt'),
      simpleTrack('Nat King Cole', 'Christmas Song'),
    ])
    // There is an entry present in DB with Artist = 'Nat King Cole' AND Title = 'Christmas Song',
    // and one with Artist = '' AND Title = 'Christmas Song',
    // We only want the result with the Artist field present
    expect(playlist.length).toBe(4)
    expect(playlist[3].artist).toEqual('Nat King Cole')
    expect(playlist[3].title).toBe('Christmas Song')
    expect(
      playlist.some((track) => track.title === '' || track.title == null)
    ).toBeFalsy()
    expect(playlist[3].lyrics).toBe("Nat King Cole's version")
  })

  it('Remove lyrics', async function () {
    let track: any = simpleTrack('fake artist', 'fake title', 'MusixMatch')
    await lyricsTab.insert(track, 'fake lyrics')
    track = await lyricsTab.queryTrack(track)
    expect(track.artist).toEqual('fake artist')
    expect(track.title).toEqual('fake title')
    expect(track.lyrics).toEqual('fake lyrics')
    await lyricsTab.remove(track)
    track = await lyricsTab.queryTrack(track)
    expect(track).toBeNull()
  })

  it('Update existing lyrics', async function () {
    let track: any = await lyricsTab.queryTrack(
      simpleTrack('Calexico', 'Sunken Waltz')
    )
    expect(track.lyrics).toEqual('')
    await lyricsTab.updateOrInsert(
      track,
      'Washed my face in the rivers of empire'
    )

    track = await lyricsTab.queryTrack(simpleTrack('Calexico', 'Sunken Waltz'))
    expect(track.lyrics).toEqual('Washed my face in the rivers of empire')

    const tracks = await lyricsTab.find({ artist: 'Calexico' })
    expect(tracks.length).toBe(1)
  })

  it('gets all lyrics', async () => {
    let results = await lyricsTab.find()
    expect(results.length).toEqual(11)

    results = await lyricsTab.find({ artist: 'Zager & Evans' })
    expect(results.length).toEqual(1)

    expect(results[0].artist).toEqual('Zager & Evans')
    expect(results[0].title).toEqual('In the Year 2525 (Exordium & Terminus)')
  })

  it('finds lyrics', async () => {
    let results = await lyricsTab.find({ artist: 'Zager & Evans' })
    expect(results.length).toEqual(1)
    expect(results[0].artist).toEqual('Zager & Evans')
    expect(results[0].title).toEqual('In the Year 2525 (Exordium & Terminus)')
  })
})
