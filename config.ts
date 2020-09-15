const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  GoogleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  GoogleApiKey: process.env.GOOGLE_API_KEY,
  dbConnectionString: process.env.DB_CONNECTION_STRING,
  spotifyKey: process.env.SPOTIFY_KEY,
  spotifySecret: process.env.SPOTIFY_SECRET,
  endpoint: process.env.ENDPOINT,
}
