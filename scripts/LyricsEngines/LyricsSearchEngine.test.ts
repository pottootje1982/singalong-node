import * as LyricsSearchEngine from "./LyricsSearchEngine";

describe("LyricsSearchEngine", () => {
  it("Get variable from query", async function () {
    let url =
      "https://accounts.spotify.com/authorize?client_id=3a2c92864fe34fdfb674580a0901568e&response_type=code&scope=user-read-private%20user-read-email&state=some-state-of-my-choice";
    var clientId = LyricsSearchEngine.getQueryVariable(url, "client_id");
    expect(clientId).toBe("3a2c92864fe34fdfb674580a0901568e");
  });
});
