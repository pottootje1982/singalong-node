import React, { useState, useContext } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Stack, useMediaQuery } from '@mui/material'
import { getCookie } from './cookie'
import CssBaseline from '@mui/material/CssBaseline'
import IdleTimer from 'react-idle-timer'
import ServerContext from './server-context'
import { PlaylistProvider } from './playlist/playlist-context'
import { DownloadProvider } from './lyrics/download-context'
import { PlayerProvider } from './player/player-context'
import { Split } from '@geoffcox/react-splitter'

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const [split] = useState(window.localStorage.getItem('split'))
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

  const Divider = mobile || lyricsFullscreen ? ({ children }) => <Stack>{children}</Stack> : ({ children, ...p }) => <Split
    initialPrimarySize={split}
    onSplitChanged={(e) => window.localStorage.setItem('split', e)}
    {...p} style={{ margin: 42 }}
  >{children}</Split>

  return (
    <>
      <PlaylistProvider>
        <DownloadProvider>
          <PlayerProvider>
            <IdleTimer element={document} onAction={onAction} debounce={500} />
            <CssBaseline />
            <Divider >
              {!lyricsFullscreen && <Library />}
              <Stack spacing={1}
                direction={lyricsFullscreen ? 'column-reverse' : 'column'}
                justifyContent={lyricsFullscreen ? 'flex-end' : 'flex-start'}             >
                <Lyrics
                  id='lyrics'
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
            </Divider>
          </PlayerProvider>
        </DownloadProvider>
      </PlaylistProvider>

    </>
  )
}

export default App
