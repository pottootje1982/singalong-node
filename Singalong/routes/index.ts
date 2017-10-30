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

router.post('/', (req, res) => {
    download.searchAzLyrics(req.body.artist, req.body.title,
        content => {
            res.render('index', {
                title: 'Express',
                lyrics: content,
            });
        });
});

export default router;