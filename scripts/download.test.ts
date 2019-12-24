import assert = require("assert")
import LyricsDownloader from "./download"
import { LyricsSearchEngine } from "./LyricsEngines/LyricsSearchEngine"
import { Track } from "./track"
import { MetroLyricsEngine } from "./LyricsEngines/MetroLyricsEngine"

import LyricsDb from "./lyrics_db"
const createTable = require("./db/tables")

describe("Downloading lyrics", () => {
  let lyricsDb: LyricsDb
  let lyricsDownloader: LyricsDownloader
  var engine: LyricsSearchEngine

  function insertTrack(artist, title, lyrics, site?: string) {
    return lyricsDb.insert(new Track(artist, title, site), lyrics)
  }

  before(async () => {
    const { lyricTable } = await createTable("./mongo-client", "testLyrics")
    lyricsDb = new LyricsDb(lyricTable)
    await lyricsDb.removeAll()
    lyricsDownloader = new LyricsDownloader(lyricsDb)
    engine = lyricsDownloader.engines["MusixMatch"]
  })

  it("Search Euson - Leon", async () => {
    var content = await engine.searchLyrics("Euson", "Leon")
    assert.equal(content, null)
  })

  it("Search Beatles Genius", async function() {
    this.timeout(5000)
    var content = await lyricsDownloader.engines["Genius"].searchLyrics(
      "beatles",
      "yellow submarine"
    )
    assert(content.indexOf("In the town where I was born") >= 0, content)
  })

  it("Search Beatles MusixMatch", async () => {
    var content = await lyricsDownloader.engines["MusixMatch"].searchLyrics(
      "beatles",
      "yellow submarine"
    )
    assert(content.indexOf("In the town where I was born") >= 0, content)
  })

  it("Search Beatles AZ", async () => {
    var content = await lyricsDownloader.engines["AzLyrics"].searchLyrics(
      "beatles",
      "yellow submarine"
    )
    assert(content.indexOf("In the town where I was born") >= 0, content)
  })

  it("Search with LyricsFreak", async () => {
    var content = await lyricsDownloader.engines["LyricsFreak"].searchLyrics(
      "Bonnie Raitt",
      "Angel from Montgomery"
    )
    assert(content.indexOf("I am an old woman\n") > -1)
  })

  it("Search multiple lyrics", async function() {
    this.timeout(20000)
    var book = await lyricsDownloader.createSongbook(
      "bladieblablabla\n" +
        "Beatles - Hard Day's night\n" +
        "John Lennon -  Imagine\n" +
        "Ray Charles - Georgia\n" +
        "paul simon - graceland\n" +
        "beatles - yellow submarine\n",
      3000
    )
    console.log(book)
    assert.equal("bladieblablabla", book[0].title)
    assert.equal(null, book[0].site)
    assert.equal(null, book[0].lyrics)
    assert(
      /It's been a hard day's night/i.test(book[1].lyrics),
      "It's been a hard day's night wasn't found"
    )
    assert.equal("Beatles", book[1].artist)
    assert.equal("Hard Day's night", book[1].title)
    assert.equal("AzLyrics", book[1].site)
    console.log(book[2].lyrics)
    assert(
      /Imagine there's no heaven/i.test(book[2].lyrics),
      "Imagine wasn't found"
    )
    assert.equal("John Lennon", book[2].artist)
    assert.equal("Imagine", book[2].title)
    assert.equal("Genius", book[2].site)
    assert(/Georgia/i.test(book[3].lyrics), "Georgia wasn't found")
    assert.equal("Ray Charles", book[3].artist)
    assert.equal("Georgia", book[3].title)
    assert.equal("MusixMatch", book[3].site)
    assert(
      /The Mississippi Delta was shining/i.test(book[4].lyrics),
      "Graceland wasn't found"
    )
    assert.equal("paul simon", book[4].artist)
    assert.equal("graceland", book[4].title)
    assert.equal("LyricsFreak", book[4].site)
    assert(
      /In the town where I was born/.test(book[5].lyrics),
      "Yellow submarine wasn't found"
    )
    assert.equal("beatles", book[5].artist)
    assert.equal("yellow submarine", book[5].title)
    assert.equal("AzLyrics", book[5].site)
  })

  it("Search unexisting lyrics", async () => {
    var lyrics = await engine.searchLyrics("bladieblablabla", "")
    assert.equal(lyrics, null)
  })

  it("Search unexisting lyrics Genius", async () => {
    var lyrics = await lyricsDownloader.engines["Genius"].searchLyrics(
      "bladieblablabla",
      ""
    )
    assert.equal(lyrics, null)
  })

  it("Search unexisting lyrics Metro", async () => {
    var lyrics = await new MetroLyricsEngine().searchLyrics(
      "bladieblablabla",
      ""
    )
    assert.equal(lyrics, null)
  })

  it("Download track", async () => {
    var track = await lyricsDownloader.downloadTrack(
      new Track("Beatles", "Yellow Submarine")
    )
    assert(track.lyrics.indexOf("In the town where I was born") >= 0)
  })

  it("Get lyrics from database", async () => {
    await insertTrack(
      "1793 George Harrison",
      "Give Me Love (Give Me Peace On Earth)",
      "Give me love",
      "Genius"
    )
    await insertTrack(
      "John Lennon",
      "Imagine",
      "Imagine there's no heaven",
      "MusixMatch"
    )
    await insertTrack(
      "Beatles",
      "Yellow Submarine",
      "In the town where I was born",
      "MusixMatch"
    )
    let playlist = [
      new Track(
        "1793 George Harrison",
        "Give Me Love (Give Me Peace On Earth)"
      ),
      new Track("Beatles", "Yellow Submarine"),
      new Track("John Lennon", "Imagine"),
      new Track("bladieblablabla", "")
    ]
    playlist = await lyricsDownloader.getLyricsFromDatabase(playlist, false)
    assert.equal(playlist.length, 3)
    assert(
      playlist[0].lyrics.indexOf("Give me love") >= 0,
      "Give me love wasn't found"
    )
    assert.equal("Genius", playlist[0].site)

    assert(
      playlist[1].lyrics.indexOf("In the town where I was born") >= 0,
      "Yellow submarine wasn't found"
    )
    assert.equal("MusixMatch", playlist[1].site)

    assert(
      playlist[2].lyrics.indexOf("Imagine there's no heaven") >= 0,
      "Imagine there's no heaven wasn't found"
    )
    assert.equal("MusixMatch", playlist[2].site)
  })
})
