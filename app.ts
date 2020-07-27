import debug = require('debug')
import express = require('express')
import path = require('path')

import routes from './routes/index'
import users from './routes/user'
import authorize from './routes/authorize'
import playlist from './routes/playlist'
import playlists from './routes/playlists'
import lyrics from './routes/lyrics'
var bodyParser = require('body-parser')
import { SpotifyApi } from './scripts/spotify'

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))

function getTokens(req) {
  const { accessToken: bodyToken } = req.body
  const { accessToken: queryToken } = req.query
  const { accesstoken: headerToken } = req.headers
  return { accessToken: bodyToken || queryToken || headerToken }
}

app.use((req, res, next) => {
  req.query.invoke = function () {
    let params = Array.prototype.slice.call(arguments, 1)
    return (
      arguments[0] +
      '(' +
      params.map((arg) => JSON.stringify(arg)).join(', ') +
      ')'
    )
  }
  res.locals.getSpotifyApi = (): SpotifyApi => {
    if (!res.locals.api)
      res.locals.api = new SpotifyApi(
        `http://${req.headers.host}`,
        getTokens(req)
      )
    return res.locals.api
  }
  next()
})

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})

const cors = require('cors')
app.use(cors())

app.use('/', routes)
app.use('/users', users)
app.use('/v2/authorize', authorize)
app.use('/v2/playlist', playlist)
app.use('/v2/playlists', playlists)
app.use('/v2/lyrics', lyrics)

// error handlers

app.use((err: any, req, res, next) => {
  res.status(err['status'] || 500)
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  })
})

app.set('port', process.env.PORT || 5000)

var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port)
})
