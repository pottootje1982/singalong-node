import assert = require('assert')
import { Track } from './track'

describe('Track', () => {
  this.timeoutTimer = '25000'

  it('Get name of track', function () {
    var track = new Track('', 'George Harrisson - Give me Love')
    assert.equal(track.toString(), 'George Harrisson - Give me Love')
  })

  it('Track without artist', function () {
    var track = Track.parse('Es ist ein Ros entsprungen')
    assert.equal(track.artist, '')
    assert.equal(track.title, 'Es ist ein Ros entsprungen')
    assert.equal(track.toString(), 'Es ist ein Ros entsprungen')
  })

  it('Get name of valide track', function () {
    var track = new Track('George Harrisson', 'Give me Love')
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
    assert.equal(track.toString(true), 'The Drifters - Under The Boardwalk')
  })

  it('Get minimal track title only', function () {
    var track = new Track(null, 'Under The Boardwalk - Single/LP Version')
    assert.equal(track.getMinimalTitle(), 'Under The Boardwalk')
    assert.equal(track.toString(true), 'Under The Boardwalk')
  })

  it('Get minimal track title of track with parenthese', function () {
    var track = Track.parse(
      'Bee Gees - Massachusetts (2008 Remastered LP Version)'
    )
    assert.equal(track.getMinimalTitle(), 'Massachusetts')
    assert.equal(track.toString(true), 'Bee Gees - Massachusetts')
  })

  it('Clean title', function () {
    var track = Track.parse('Bonnie Raitt - Angel From Montgomery (Remastered)')
    assert.equal(track.cleanArtist(), 'Bonnie Raitt')
    assert.equal(track.cleanTitle(), 'Angel From Montgomery')
  })

  it('Empty track', function () {
    var track = Track.parse('')
    assert.equal(track, null)
  })

  // Decided to not clean numbers from artist/title, since the clean function also affects titles
  // It is quite common to start a title with a number
  it('Is track dirty?', function () {
    var track = new Track('1793 George Harrison', 'Give me Love')
    assert.equal(false, track.canClean())
    assert.equal('1793 George Harrison', track.cleanArtist())
    assert.equal('Give me Love', track.cleanTitle())
  })
})
