import React, { useState } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Grid, useMediaQuery } from '@material-ui/core'
import { getCookie } from './cookie'
import CssBaseline from '@material-ui/core/CssBaseline'
import IdleTimer from 'react-idle-timer'
import { getFreshToken } from './server'

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const mobile = !useMediaQuery('(min-width:600px)')

  const [trackFilters, setTrackFilters] = useState({
    minimalTitle: true,
    isNotDownloaded: false,
    hideArtist: false,
  })

  function onAction() {
    if (!getCookie('accessToken')) {
      getFreshToken()
    }
  }

  return (
    <>
      <IdleTimer element={document} onAction={onAction} debounce={500} />
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
              lyricsFullscreen={lyricsFullscreen}
              setLyricsFullscreen={setLyricsFullscreen}
              trackFilters={trackFilters}
            ></Lyrics>
            <Playlist
              lyricsFullscreen={lyricsFullscreen}
              trackFilters={trackFilters}
              setTrackFilters={setTrackFilters}
            ></Playlist>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default App
