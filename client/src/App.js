import React, { useState, useContext } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Grid, Stack, useMediaQuery } from '@mui/material'
import { getCookie } from './cookie'
import CssBaseline from '@mui/material/CssBaseline'
import IdleTimer from 'react-idle-timer'
import ServerContext from './server-context'
import { PlaylistProvider } from './playlist/playlist-context'
import { DownloadProvider } from './lyrics/download-context'
import { PlayerProvider } from './player/player-context'

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const mobile = !useMediaQuery('(min-width:600px)')
  const { getFreshToken } = useContext(ServerContext)

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
      <PlaylistProvider>
        <DownloadProvider>
          <PlayerProvider>
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
                <Stack
                  direction={lyricsFullscreen ? 'column-reverse' : 'column'}
                  justifyContent={lyricsFullscreen ? 'flex-end' : 'flex-start'}
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
                </Stack>
              </Grid>
            </Grid>
          </PlayerProvider>
        </DownloadProvider>
      </PlaylistProvider>

    </>
  )
}

export default App
