﻿import assert = require('assert');
import { Track } from '../scripts/Track';

describe("Lyrics DB", () => {
    this.timeoutTimer = "25000";

    it("Get name of track",
         function () {
             var track = new Track('', 'George Harrisson - Give me Love');
             assert.equal(track.toString(), 'George Harrisson - Give me Love');
         });

    it("Get name of valide track",
        function () {
            var track = new Track('George Harrisson', 'Give me Love');
            assert.equal(track.toString(), 'George Harrisson - Give me Love');
        });

    it("Get name of album track",
        function () {
            var track = Track.parse('The Drifters - Under The Boardwalk - Single/LP Version');
            assert.equal(track.toString(), 'The Drifters - Under The Boardwalk - Single/LP Version');
        });

    it("Is track dirty?",
        function () {
            var track = new Track('1793 George Harrison', 'Give me Love');
            assert.equal(true, track.canClean());
            assert.equal('George Harrison', track.cleanArtist());
            assert.equal('Give me Love', track.cleanTitle());
        });



});
