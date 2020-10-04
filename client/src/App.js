import React, { useState, useEffect } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Grid, useMediaQuery } from '@material-ui/core'
import { getCookie } from './cookie'
import { getFreshToken } from './server'
import CssBaseline from '@material-ui/core/CssBaseline'
import { useHistory } from 'react-router-dom'

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const [token, setToken] = useState(getCookie('accessToken'))
  const mobile = !useMediaQuery('(min-width:600px)')
  const history = useHistory()

  const [trackFilters, setTrackFilters] = useState({
    minimalTitle: true,
    isNotDownloaded: false,
    hideArtist: false,
  })

  function init() {
    if (!token)
      getFreshToken().then((t) => {
        if (t) setToken(t)
        else history.push('/authorize')
      })
  }
  useEffect(init, [])

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
          <Library></Library>
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
