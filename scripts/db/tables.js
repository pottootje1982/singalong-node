const LyricsTable = require("./table/lyrics")

module.exports = async function createLyricsTable(connector, tableName) {
  const createDb = require(connector)

  const db = await createDb()
  const lyricTable = new LyricsTable(db, tableName)

  return { lyricTable }
}
