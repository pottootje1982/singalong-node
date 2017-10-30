﻿import assert = require('assert');
import download = require('./download');

describe("Downloading lyrics", () => {
    this.timeout = "15000";

    /*
    it("Search with Google", function (done) {
        download.search("beatles", "yellow submarine",
            content => {
                assert(content.indexOf('In the town where I was born') === 0);
                done();
            });
    });
    */

    it("Search Beatles with AzLyrics", async () => {
        var content = await download.searchAzLyrics("beatles", "yellow submarine");
        assert(content.indexOf('In the town where I was born') === 0);
    });

    it("Search paul simon with AzLyrics", async () => {
        var content = await download.searchAzLyrics("paul simon", "graceland");
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });
    
    
    it("Search multiple lyrics with AzLyrics", async () => {
        var book = await download.searchLyrics("deep purple - child in time\n" +
            "paul simon - graceland\n" +
            "beatles - yellow submarine\n");
        assert(book.indexOf('In the town where I was born') > 0);
    });
});
