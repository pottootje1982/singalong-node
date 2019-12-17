const createDb = require("../tables")

describe("storeRecipe()", () => {
  let lyricTable

  beforeEach(async () => {
    ;({ lyricTable } = await createDb("./memory-db", "./data/db.test.json"))
  })

  it("get lyrics", async () => {
    const orders = await lyricTable.get({ Artist: "Zager & Evans" })
    expect(orders.length).toEqual(4)
  })

  xit("get real lyrics", async () => {
    const { lyricTable } = await createDb("./mongo-client")
    const tracks = await lyricTable.get({
      Artist: /beatles/i,
      Title: /blackbird/
    })
    console.log(tracks)
  })
})
