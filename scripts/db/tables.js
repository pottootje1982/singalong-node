const LyricsTable = require("./table/lyrics")

module.exports = async function createLyricsDb(connector, file) {
  const createDb = require(connector)

  const db = await createDb(file)
  const lyricTable = new LyricsTable(db)

  return { lyricTable }
}
