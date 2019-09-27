﻿import assert = require('assert');
import * as LyricsSearchEngine from './LyricsSearchEngine';

describe("LyricsSearchEngine", () => {
    this.timeoutTimer = "25000";

    it("Get variable from query",
        async function () {
            let url = 'https://accounts.spotify.com/authorize?client_id=3a2c92864fe34fdfb674580a0901568e&response_type=code&scope=user-read-private%20user-read-email&state=some-state-of-my-choice';
            var clientId = LyricsSearchEngine.getQueryVariable(url, 'client_id');
            assert.equal(clientId, '3a2c92864fe34fdfb674580a0901568e');
        });


});