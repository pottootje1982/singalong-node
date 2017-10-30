"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
var express = require("express");
var download = require("../scripts/download");
var router = express.Router();
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
    });
});
router.post('/', function (req, res) {
    //res.render('index', {
    //    title: 'Express',
    //    lyrics: req.body.artist + ' - ' + req.body.title,
    //});
    download.searchAzLyrics(req.body.artist, req.body.title, function (content) {
        res.render('index', {
            title: 'Express',
            lyrics: content,
        });
    });
});
router.get('/text', function (req, res) {
    download.search("beatles", "yellow submarine", function (content) {
        res.render('index', {
            title: 'Express',
            lyrics: content,
        });
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map