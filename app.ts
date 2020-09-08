import debug = require('debug')
import express = require('express')
import path = require('path')

import authorize from './routes/authorize'
import playlists from './routes/playlists'
import lyrics from './routes/lyrics'
import player from './routes/player'
import radio from './routes/radio'
var bodyParser = require('body-parser')

var app = express()

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, '/client/public')))

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})

const cors = require('cors')
app.use(cors())

app.use('/authorize', authorize)
app.use('/playlists', playlists)
app.use('/lyrics', lyrics)
app.use('/player', player)
app.use('/radio', radio)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

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
