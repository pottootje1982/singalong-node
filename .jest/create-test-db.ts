import createDb from "../scripts/db/databases";
const { lyrics: testLyrics } = require("../scripts/db/data/db.test.json");

import createMongoClient from "../scripts/db/mongo-client";
let client;

beforeAll(async () => {
  client = await createMongoClient();
  const dbs = await createDb(client);
  const { lyrics, customPlaylists, playlists, lyricsDownloader } = dbs;
  await lyrics.table().insertMany(testLyrics);
  global.lyrics = lyrics;
  global.customPlaylists = customPlaylists;
  global.playlists = playlists;
  global.lyricsDownloader = lyricsDownloader;
});

afterAll(async () => {
  if (global?.lyrics) {
    await global?.lyrics.table().deleteMany();
    await global?.customPlaylists.table().deleteMany();
    await global?.playlists.table().deleteMany();
    await client?.close();
  }
});
