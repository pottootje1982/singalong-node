const assert = require('assert')
import { Track, simpleTrack } from './track'

describe('Track', () => {
  this.timeoutTimer = '25000'

  it('Get name of track', function () {
    var track = simpleTrack('', 'George Harrisson - Give me Love')
    assert.equal(track.toString(), 'George Harrisson - Give me Love')
  })

  it('Track without artist', function () {
    var track = Track.parse('Es ist ein Ros entsprungen')
    assert.equal(track.artist, '')
    assert.equal(track.title, 'Es ist ein Ros entsprungen')
    assert.equal(track.toString(), 'Es ist ein Ros entsprungen')
  })

  it('Get name of valide track', function () {
    var track = simpleTrack('George Harrisson', 'Give me Love')
    assert.equal(track.toString(), 'George Harrisson - Give me Love')
  })

  it('Get name of album track', function () {
    var track = Track.parse(
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
    assert.equal(track.artist, 'The Drifters')
    assert.equal(track.title, 'Under The Boardwalk - Single/LP Version')
    assert.equal(
      track.toString(),
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
  })

  it('Get minimal track', function () {
    var track = Track.parse(
      'The Drifters - Under The Boardwalk - Single/LP Version'
    )
    assert.equal(track.getMinimalTitle(), 'Under The Boardwalk')
    assert.equal(
      track.toString({ minimalTitle: true }),
      'The Drifters - Under The Boardwalk'
    )
  })

  it('Get minimal track title only', function () {
    var track = simpleTrack(null, 'Under The Boardwalk - Single/LP Version')
    assert.equal(track.getMinimalTitle(), 'Under The Boardwalk')
    assert.equal(track.toString({ minimalTitle: true }), 'Under The Boardwalk')
  })

  it('Get minimal track title of track with parenthese', function () {
    var track = Track.parse(
      'Bee Gees - Massachusetts (2008 Remastered LP Version)'
    )
    assert.equal(track.getMinimalTitle(), 'Massachusetts')
    assert.equal(
      track.toString({ minimalTitle: true }),
      'Bee Gees - Massachusetts'
    )
  })

  it('Clean title', function () {
    var track = Track.parse('Bonnie Raitt - Angel From Montgomery (Remastered)')
    assert.equal(track.cleanArtist(), 'Bonnie Raitt')
    assert.equal(track.cleanTitle(), 'Angel From Montgomery')
  })

  it('Cleans title starting with ()', () => {
    var track = Track.parse('Otis Redding - (Sitting in the) dock of the bay')
    assert.equal(track.cleanArtist(), 'Otis Redding')
    assert.equal(track.cleanTitle(), '(Sitting in the) dock of the bay')
  })

  it('Cleans title containing []', () => {
    var track = Track.parse(
      'Otis Redding - (Sitting in the) dock of the bay [Remastered]'
    )
    assert.equal(track.cleanArtist(), 'Otis Redding')
    assert.equal(track.cleanTitle(), '(Sitting in the) dock of the bay')
  })

  it('Empty track', function () {
    var track = Track.parse('')
    assert.equal(track, null)
  })

  it('Get query string track', () => {
    const track = simpleTrack(
      'Pat Thomas & Kwashibu Area Band',
      'Onfa nkosi hwee'
    )
    assert.equal(
      track.getQuery(),
      'Pat Thomas  Kwashibu Area Band Onfa nkosi hwee'
    )
  })

  // Decided to not clean numbers from artist/title, since the clean function also affects titles
  // It is quite common to start a title with a number
  it('Is track dirty?', function () {
    var track = simpleTrack('1793 George Harrison', 'Give me Love')
    assert.equal(false, track.canClean())
    assert.equal('1793 George Harrison', track.cleanArtist())
    assert.equal('Give me Love', track.cleanTitle())
  })
})
