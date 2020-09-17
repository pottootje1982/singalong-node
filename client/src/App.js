import React, { useState, useEffect } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Grid, useMediaQuery } from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import { getCookie } from './cookie'
import server, { get } from './server'
import CssBaseline from '@material-ui/core/CssBaseline'

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const [token, setToken] = useState(getCookie('accessToken'))
  const refreshToken = getCookie('refreshToken')
  const mobile = !useMediaQuery('(min-width:600px)')

  const [trackFilters, setTrackFilters] = useState({
    minimalTitle: true,
    isNotDownloaded: false,
    hideArtist: false,
  })

  function init() {
    if (!token) getFreshToken()
  }
  useEffect(init, [])

  function getFreshToken() {
    get('/authorize/refresh', {
      refreshToken: getCookie('refreshToken'),
    }).then(({ data }) => {
      if (data) {
        console.log('Refreshed token to ', data)
        server.setToken(data)
        setToken(data.access_token)
      } else {
        setToken('redirect')
      }
    })
  }

  if (token === 'redirect' || (!token && !refreshToken)) {
    return <Redirect to={'/authorize'} />
  }

  window.history.pushState('', '', '/main')
  return token ? (
    <>
      <CssBaseline />
      <Grid
        container
        spacing={1}
        style={{
          margin: 0,
          width: '98%',
        }}
      >
        <Grid item xs style={{ display: lyricsFullscreen && 'none' }}>
          <Library getFreshToken={getFreshToken}></Library>
        </Grid>
        <Grid item xs={lyricsFullscreen || mobile ? 12 : 8}>
          <Grid
            container
            direction={lyricsFullscreen ? 'column-reverse' : 'column'}
            justify={lyricsFullscreen ? 'flex-end' : 'flex-start'}
            spacing={1}
            alignItems="stretch"
          >
            <Lyrics
              token={token}
              lyricsFullscreen={lyricsFullscreen}
              setLyricsFullscreen={setLyricsFullscreen}
              trackFilters={trackFilters}
            ></Lyrics>
            <Playlist
              lyricsFullscreen={lyricsFullscreen}
              token={token}
              trackFilters={trackFilters}
              setTrackFilters={setTrackFilters}
            ></Playlist>
          </Grid>
        </Grid>
      </Grid>
    </>
  ) : (
    <React.Fragment />
  )
}

export default App
