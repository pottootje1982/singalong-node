import assert = require('assert');
import download = require('./download');
import { Track } from "./track";
import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine";

describe("Downloading lyrics", () => {
//    this.timeout = "100000";

    var engine = download.engines["MusixMatch"];

    it("Search Euson - Leon", async () => {
        var content = await engine.searchLyrics("Euson", "Leon");
        assert.equal(content, null);
    });

    it("Search David McWilliams", async () => {
        var content = await engine.searchLyrics("David McWilliams", "Can I Get There By Candlelight");
        assert(content.indexOf('This is the way to the rolling drums') >= 0, content);
        assert(content.indexOf('Made with love & passion in Italy') === -1);
    });

    it("Search Frank Zappa", async () => {
        var content = await engine.searchLyrics("Frank Zappa", "Dancin fool");
        assert(content.indexOf("Don't know much about dancin'") >= 0, content);
    });
    
    it("Search Beatles Genius", async () => {
        var content = await download.engines["Genius"].searchLyrics("beatles", "yellow submarine");
        console.log(content);
        assert(content.indexOf('In the town where I was born') >= 0, content);
    });

    it("Search Beatles Metro", async () => {
        var content = await new MetroLyricsEngine().searchLyrics("beatles", "yellow submarine");
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
    
    it("Search with LyricsFreak", async () => {
         var content = await download.engines["LyricsFreak"].searchLyrics('Bonnie Raitt', 'Angel from Montgomery');
         assert(content.indexOf('I am an old woman\n') > -1);
    });
    
   it("Search Paul simon", async () => {
        var content = await engine.searchLyrics("paul simon", "graceland");
        console.log(content);
        assert(content.indexOf('The Mississippi Delta was shining') > -1);
    });

    it("Search multiple lyrics", async function() {
        this.timeout(10000);
        var book = await download.createSongbook("bladieblablabla\n" +
            "Beatles - Hard Day's night\n" +
            "John Lennon -  Imagine\n" +
            "Ray Charles - Georgia\n" +
            "paul simon - graceland\n" +
            "beatles - yellow submarine\n", 3000);
        assert.equal('bladieblablabla', book[0].title);
        assert.equal(null, book[0].site);
        assert.equal(null, book[0].lyrics);
        assert(book[1].lyrics.indexOf("It's been a hard day's night") >= 0, "It's been a hard day's night wasn't found");
        assert.equal('Beatles', book[1].artist);
        assert.equal("Hard Day's night", book[1].title);
        assert.equal("Genius", book[1].site);
        assert(book[2].lyrics.indexOf("Imagine there's no heaven") >= 0, "Imagine there's no heaven wasn't found");
        assert.equal('John Lennon', book[2].artist);
        assert.equal("Imagine", book[2].title);
        assert.equal("MusixMatch", book[2].site);
        assert(book[3].lyrics.indexOf('Georgia') >= 0, "Georgia wasn't found");
        assert.equal('Ray Charles', book[3].artist);
        assert.equal("Georgia", book[3].title);
        assert.equal("Genius", book[3].site);
        assert(book[4].lyrics.indexOf("The Mississippi Delta was shining") >= 0, "Graceland wasn't found");
        assert.equal('paul simon', book[4].artist);
        assert.equal("graceland", book[4].title);
        assert.equal("Genius", book[4].site);
        assert(book[5].lyrics.indexOf('In the town where I was born') >= 0, "Yellow submarine wasn't found");
        assert.equal('beatles', book[5].artist);
        assert.equal("yellow submarine", book[5].title);
        assert.equal("MusixMatch", book[5].site);
    });

    it("Search unexisting lyrics", async () => {
        var lyrics = await engine.searchLyrics("bladieblablabla", "");
        assert.equal(lyrics, null);
    });

    it("Search unexisting lyrics Genius", async () => {
        var lyrics = await download.engines["Genius"].searchLyrics("bladieblablabla", "");
        assert.equal(lyrics, null);
    });

    it("Search unexisting lyrics Metro", async () => {
        var lyrics = await new MetroLyricsEngine().searchLyrics("bladieblablabla", "");
        assert.equal(lyrics, null);
    });

    it("Get lyrics from database", async () => {
        let playlist = [
            new Track('1793 George Harrison', 'Give me Love'),
            new Track("Beatles", "Yellow Submarine"),
            new Track("John Lennon", "Imagine"),
            new Track("bladieblablabla", "")
        ];
        playlist = await download.getLyricsFromDatabase(playlist);
        assert.equal(playlist.length, 3);
        assert(playlist[0].lyrics.indexOf("Give me love") >= 0, "Give me love wasn't found");
        assert.equal("Genius", playlist[0].site);

        assert(playlist[1].lyrics.indexOf('In the town where I was born') >= 0, "Yellow submarine wasn't found");
        assert.equal("MusixMatch", playlist[1].site);

        assert(playlist[2].lyrics.indexOf("Imagine there's no heaven") >= 0, "Imagine there's no heaven wasn't found");
        assert.equal("MusixMatch", playlist[2].site);

    });

});
