import debug = require('debug');
import express = require('express');
import path = require('path');

import routes from './routes/index';
import users from './routes/user';
var bodyParser = require('body-parser');
import { SpotifyApi } from "./scripts/spotify";

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

function getTokens(req) {
    return req.body.accessToken ? req.body : req.query;
}

app.use((req, res, next) => {
    req.query.invoke = function () {
        let params = Array.prototype.slice.call(arguments, 1);
        return arguments[0] + '(' + params.map(arg => JSON.stringify(arg)).join(', ') + ')';
    }
    res.locals.getSpotifyApi = () : SpotifyApi => {
        if (!res.locals.api)
            res.locals.api = new SpotifyApi(req.headers.host, getTokens(req));
        return res.locals.api;
    }
    next();
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err: any, req, res, next) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
