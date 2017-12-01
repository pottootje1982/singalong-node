import assert = require('assert');
import download = require('./download');

describe("Downloading lyrics", () => {
    this.timeout = "100000";

    var engine = download.engines["MusixMatch"];

    it("Search Beatles", async () => {
        var content = await engine.searchLyrics("beatles", "yellow submarine");
        assert(content.indexOf('In the town where I was born') >= 0, content);
    });

    it("Search Beatles Genius", async () => {
        var content = await download.engines["Genius"].searchLyrics("beatles", "yellow submarine");
        console.log(content);
        assert(content.indexOf('In the town where I was born') >= 0, content);
    });

    it("Search Beatles Metro", async () => {
        var content = await download.engines["MetroLyrics"].searchLyrics("beatles", "yellow submarine");
        console.log(content);
        assert(content.indexOf('In the town where I was born') >= 0, content);
    });

    it("Search Beatles AZ", async () => {
        var content = await download.engines["AzLyrics"].searchLyrics("beatles", "yellow submarine");
        console.log(content);
        assert(content.indexOf('In the town where I was born') >= 0, content);
    });

    it("Search paul simon", async () => {
        var content = await engine.searchLyrics("paul simon", "graceland");
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });
    
    it("Search Paul simon", async () => {
        var content = await engine.searchLyrics("paul simon", "graceland");
        console.log(content);
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });
    
    it("Search multiple lyrics", async () => {
        var book = await download.createSongbook("Ray Charles - Georgia\n" +
            "paul simon - graceland\n" +
            "beatles - yellow submarine\n", engine);
        assert(book[0].lyrics.indexOf('Georgia') >= 0, "Georgia wasn't found");
        assert(book[1].lyrics.indexOf("The Mississippi Delta was shining") >= 0, "Graceland wasn't found");
        assert(book[2].lyrics.indexOf('In the town where I was born') >= 0, "Yellow submarine wasn't found");
    });

    it("Search unexisting lyrics", async () => {
        var lyrics = await engine.searchLyrics("bladieblablabla", "");
        assert(undefined === lyrics);
    });

    it("Trim songbook2", async () => {
        var book = await download.createSongbook("Kabouter spillebeen", engine);
        assert('Kabouter spillebeen' === book[0].artist);
    });
});
