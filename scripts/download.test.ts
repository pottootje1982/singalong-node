const assert = require("assert");
import LyricsDownloader from "./download";
import { Track, simpleTrack } from "../client/src/track";
import LyricsTable from "./db/table/lyrics";
import {
  MusixMatchEngineMock,
  AzLyricsEngineMock,
  GeniusEngineMock,
  LyricsFreakEngineMock,
  MetroLyricsEngineMock,
  ChartLyricsEngineMock,
} from "./download.mock";

describe("Downloading lyrics", () => {
  let lyricsTab: LyricsTable;
  let downloader: LyricsDownloader;
  let musixMatchMock: MusixMatchEngineMock;

  function insertTrack(artist, title, lyrics, site?: string) {
    return lyricsTab.insert(new Track({ artist, title, site }), lyrics);
  }

  beforeAll(async () => {
    musixMatchMock = new MusixMatchEngineMock();
    lyricsTab = global.lyrics;
    downloader = global.lyricsDownloader;
    downloader.engines = {
      AzLyrics: new AzLyricsEngineMock(),
      Genius: new GeniusEngineMock(),
      MusixMatch: new MusixMatchEngineMock(),
      LyricsFreak: new LyricsFreakEngineMock(),
    };
  });

  it("Search Euson - Leon", async () => {
    var content = await musixMatchMock.searchLyrics("Euson", "Leon");
    assert.equal(content, null);
  });

  it("Search Beatles MusixMatch", async () => {
    var content = await musixMatchMock.searchLyrics(
      "beatles",
      "yellow submarine"
    );
    assert(content.indexOf("In the town where I was born") >= 0, content);
  });

  it("Search unexisting lyrics MusixMatch", async () => {
    var lyrics = await musixMatchMock.searchLyrics("blabla-musixmatch", "");
    assert.equal(lyrics, null);
  });

  it("Search unexisting lyrics Genius", async () => {
    const geniusMock = new GeniusEngineMock();
    var lyrics = await geniusMock.searchLyrics("blablabla-genius", "");
    assert.equal(lyrics, null);
  });

  it("Search beatles dig a pony with Genius", async () => {
    const geniusMock = new GeniusEngineMock();
    var lyrics = await geniusMock.searchLyrics("beatles", "dig a pony");
    expect(lyrics).toContain("[Verse 1]\nI dig a pony");
    expect(lyrics).toContain("[Outro]\nYou");
  });

  it("Search unexisting lyrics Metro", async () => {
    const engine = new MetroLyricsEngineMock();
    var lyrics = await engine.searchLyrics("bladiebla-metrolyrics", "");
    assert.equal(lyrics, null);
  });

  it("Search with AzLyrics", async () => {
    const engine = new AzLyricsEngineMock();
    var lyrics = await engine.searchLyrics("dire straits", "news");
    expect(lyrics).toContain("He sticks to his guns");
  });

  it("Download track", async () => {
    var track = await downloader.downloadTrack(
      simpleTrack("The Beatles", "A day in life")
    );
    expect(track.lyrics).toContain("I read the news today");
  });

  it("Search with chart lyrics", async () => {
    const engine = new ChartLyricsEngineMock();
    var lyrics = await engine.searchLyrics("michael jackson", "bad");
    expect(lyrics).toContain("Your butt is mine... ");
  });

  it("Get lyrics from database", async () => {
    await insertTrack(
      "1793 George Harrison",
      "Give Me Love (Give Me Peace On Earth)",
      "Give me love",
      "Genius"
    );
    await insertTrack(
      "John Lennon",
      "Imagine",
      "Imagine there's no heaven",
      "MusixMatch"
    );
    await insertTrack(
      "Beatles",
      "Yellow Submarine",
      "In the town where I was born",
      "MusixMatch"
    );
    let playlist = [
      simpleTrack(
        "1793 George Harrison",
        "Give Me Love (Give Me Peace On Earth)"
      ),
      simpleTrack("Beatles", "Yellow Submarine"),
      simpleTrack("John Lennon", "Imagine"),
      simpleTrack("bladieblablabla", ""),
    ];
    playlist = await downloader.getLyricsFromDatabase(playlist, false);
    expect(playlist.length).toBe(3);
    expect(playlist[0].lyrics).toEqual("Give me love");
    expect("Genius").toEqual(playlist[0].site);

    expect(playlist[1].lyrics).toEqual("In the town where I was born");
    expect(playlist[1].site).toEqual("MusixMatch");

    expect(playlist[2].lyrics).toEqual("Imagine there's no heaven");
    expect(playlist[2].site).toEqual("MusixMatch");
  });
});
