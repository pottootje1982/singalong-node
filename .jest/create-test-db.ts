import createDb from '../scripts/db/databases'
const {
    lyrics: testLyrics,
} = require('../scripts/db/data/db.test.json')

let client

beforeAll(async () => {
    const dbs = await createDb()
    const { lyrics, customPlaylists, playlists, lyricsDownloader } = dbs
    client = dbs.client
    await lyrics.table().insertMany(testLyrics)
    global.lyrics = lyrics
    global.customPlaylists = customPlaylists
    global.playlists = playlists
    global.lyricsDownloader = lyricsDownloader
})

afterAll(async () => {
    if (global?.lyrics) {
        await global?.lyrics.table().deleteMany()
        await global?.customPlaylists.table().deleteMany()
        await global?.playlists.table().deleteMany()
        await client?.close()

    }
})
