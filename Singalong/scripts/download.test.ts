import assert = require('assert');
import download = require('./download');

describe("Downloading lyrics", () => {
    this.timeout = "35000";

    var searchFunc = download.searchMatch;

    /*
    it("Search with Google", function (done) {
        download.search("beatles", "yellow submarine",
            content => {
                assert(content.indexOf('In the town where I was born') === 0);
                done();
            });
    });
    */
 
    it("Search Beatles", async () => {
        var content = await searchFunc("beatles", "yellow submarine");
        assert(content.indexOf('In the town where I was born') === 0);
    });

    it("Search paul simon", async () => {
        var content = await searchFunc("paul simon", "graceland");
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });
    
    it("Search Paul simon", async () => {
        var content = await searchFunc("paul simon", "graceland");
        console.log(content);
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });
    
    it("Search multiple lyrics", async () => {
        var book = await download.createSongbook("Ray Charles - Georgia\n" +
            "paul simon - graceland\n" +
            "beatles - yellow submarine\n", searchFunc);
        assert(book[0].lyrics.indexOf('Georgia') >= 0, "Georgia wasn't found");
        assert(book[1].lyrics.indexOf("The Mississippi Delta was shining") >= 0, "Graceland wasn't found");
        assert(book[2].lyrics.indexOf('In the town where I was born') >= 0, "Yellow submarine wasn't found");
    });

    it("Search unexisting lyrics", async () => {
        var lyrics = await searchFunc("bladieblablabla", "");
        assert('' === lyrics);
    });

    it("Trim songbook2", async () => {
        var book = await download.createSongbook("Kabouter spillebeen", searchFunc);
        assert('Kabouter spillebeen' === book[0].artist);
    });
});
