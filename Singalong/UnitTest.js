var assert = require("assert");
var download = require('./scripts/download');

describe("Downloading lyrics", function () {
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

    it("Search with AzLyrics", function (done) {
        download.searchAzLyrics("beatles", "yellow submarine",
            content => {
                assert(content.indexOf('In the town where I was born') === 0);
                done();
            });
    });

});
