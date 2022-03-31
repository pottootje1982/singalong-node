import debug = require('debug')
import express = require('express')
import path = require('path')
import { AddressInfo } from 'net'

import authorize from './routes/authorize'
import playlists from './routes/playlists'
import lyrics from './routes/lyrics'
import radio from './routes/radio'
import spotify from './routes/spotify'
import logger = require('morgan')
import createDb from './scripts/db/databases'
import createMongoClient from './scripts/db/mongo-client'

var bodyParser = require('body-parser')

var app = express()

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')))

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, '/client/public')))

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})

// error handlers
app.use((err: any, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
})

let client
createMongoClient().then(c => client = c)

app.use(async (req, res, next) => {
  res.locals.createDb = async () => {
    const dbs = await createDb(client)
    return dbs
  }
  next()
})

const cors = require('cors')
app.use(cors())

app.use('/api/authorize', authorize)
app.use('/api/playlists', playlists)
app.use('/api/lyrics', lyrics)
app.use('/api/radio', radio)
app.use('/api/spotify', spotify)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})


app.set('port', process.env.PORT || 5000)

var server = app.listen(app.get('port'), function () {
  debug(
    'Express server listening on port ' + (server.address() as AddressInfo).port
  )
})
