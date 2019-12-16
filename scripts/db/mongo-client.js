const { dbConnectionString } = require("../../config")
const MongoWrapper = require("./mongo-wrapper")

const { MongoClient } = require("mongodb")

async function createDb() {
  const client = await MongoClient.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => {
    console.log(err)
  })

  if (!client) {
    return
  }

  try {
    return new MongoWrapper(client)
  } catch (err) {
    console.log(err)
  }
}

module.exports = createDb
