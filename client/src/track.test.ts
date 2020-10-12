import { Track, simpleTrack } from './track'

describe('Track', () => {
  it('Get name of track', function () {
    var track = simpleTrack('', 'George Harrisson - Give me Love')
    expect(track.toString()).toBe('George Harrisson - Give me Love')
  })

  it('Cleans artist with ampersand', function () {
    var track = simpleTrack(
      'Christopher Paul Stelling & Julia Christgau & Kieran Ledwidge & Michael Harlen & Jordan Rose',
      'The cost of doing business'
    )
    expect(track.cleanArtist()).toBe(
      'Christopher Paul Stelling Julia Christgau Kieran Ledwidge Michael Harlen Jordan Rose'
    )
  })

  it('Track without artist', function () {
    var track = Track.parse('Es ist ein Ros entsprungen')
    expect(track.artist).toBe('')
    expect(track.title).toBe('Es ist ein Ros entsprungen')
    expect(track.toString()).toBe('Es ist ein Ros entsprungen')
  })

  it('Get name of valide track', function () {
    var track = simpleTrack('George Harrisson', 'Give me Love')
    expect(track.toString()).toBe('George Harrisson - Give me Love')
  })

  it('Get name of album track', function () {
    var track = Track.parse(
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
    expect(track.artist).toBe('The Drifters')
    expect(track.title).toBe('Under The Boardwalk - Single/LP Version')
    expect(track.toString()).toBe(
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
  })

  it('Get minimal track', function () {
    var track = Track.parse(
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
    expect(track.getMinimalTitle()).toBe('Under The Boardwalk')
    expect(track.toString({ minimalTitle: true })).toBe(
      'The Drifters - Under The Boardwalk'
    )
  })

  it('Get minimal track title only', function () {
    var track = simpleTrack(null, 'Under The Boardwalk - Single/LP Version')
    expect(track.getMinimalTitle()).toBe('Under The Boardwalk')
    expect(track.toString({ minimalTitle: true })).toBe('Under The Boardwalk')
  })

  it('Get minimal track title of track with parenthese', function () {
    var track = Track.parse(
      'Bee Gees - Massachusetts (2008 Remastered LP Version)'
    )
    expect(track.getMinimalTitle()).toBe('Massachusetts')
    expect(track.toString({ minimalTitle: true })).toBe(
      'Bee Gees - Massachusetts'
    )
  })

  it('get minimal title complex', () => {
    const track = simpleTrack(
      '',
      'Shine On You Crazy Diamond (Parts 1 - 5) [Edit] (2011 Remastered Version)'
    )
    expect(track.getMinimalTitle()).toBe('Shine On You Crazy Diamond')
  })

  it('Clean title', function () {
    var track = Track.parse('Bonnie Raitt - Angel From Montgomery (Remastered)')
    expect(track.cleanArtist()).toBe('Bonnie Raitt')
    expect(track.cleanTitle()).toBe('Angel From Montgomery')
  })

  it('Cleans title starting with ()', () => {
    var track = Track.parse('Otis Redding - (Sitting in the) dock of the bay')
    expect(track.cleanArtist()).toBe('Otis Redding')
    expect(track.cleanTitle()).toBe('(Sitting in the) dock of the bay')
  })

  it('Cleans title containing []', () => {
    var track = Track.parse(
      'Otis Redding - (Sitting in the) dock of the bay [Remastered]'
    )
    expect(track.cleanArtist()).toBe('Otis Redding')
    expect(track.cleanTitle()).toBe('(Sitting in the) dock of the bay')
  })

  it('Empty track', function () {
    var track = Track.parse('')
    expect(track).toBeNull()
  })

  it('Get query string track', () => {
    const track = simpleTrack(
      'Pat Thomas & Kwashibu Area Band',
      'Onfa nkosi hwee'
    )
    expect(track.getQuery()).toBe(
      'Pat Thomas Kwashibu Area Band Onfa nkosi hwee'
    )
  })

  // Decided to not clean numbers from artist/title, since the clean function also affects titles
  // It is quite common to start a title with a number
  it('Is track dirty?', function () {
    var track = simpleTrack('1793 George Harrison', 'Give me Love')
    expect(track.canClean()).toBeFalsy()
    expect(track.cleanArtist()).toBe('1793 George Harrison')
    expect(track.cleanTitle()).toBe('Give me Love')
  })
})
