import assert = require('assert');
import download = require('./download');

describe("Downloading lyrics", () => {
    this.timeoutTimer = "15000";

    /*
    it("Search with Google", function (done) {
        download.search("beatles", "yellow submarine",
            content => {
                assert(content.indexOf('In the town where I was born') === 0);
                done();
            });
    });
    */

    it("Search with AzLyrics", done => {
        download.searchAzLyrics("beatles", "yellow submarine",
            content => {
                assert(content.indexOf('In the town where I was born') === 0);
                done();
            });
    });
    
});
