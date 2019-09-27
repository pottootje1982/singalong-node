const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  GoogleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  GoogleApiKey: process.env.GOOGLE_API_KEY
}
