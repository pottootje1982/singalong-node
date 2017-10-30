/*
 * GET home page.
 */
import express = require('express');
var download = require("../scripts/download");
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.render('index',
        {
            title: 'Express',
        });
});

router.post('/', async (req, res) => {
    var book = await download.searchLyrics(req.body.playlist);
    res.render('index', {
        title: 'Express',
        lyrics: book,
    });
});

export default router;