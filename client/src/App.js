import React, { useState, useContext } from 'react'
import Library from './library'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { useMediaQuery } from '@mui/material'
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
  const [playlistSplit, setPlaylistSplit] = useState({})
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
            <Split
            >
              <Library></Library>
              <Split
                onMeasuredSizesChanged={setPlaylistSplit}
                resetOnDoubleClick
                horizontal
                spacing={1}
                alignItems="stretch"
              >
                <Lyrics
                  lyricsFullscreen={lyricsFullscreen}
                  setLyricsFullscreen={setLyricsFullscreen}
                  trackFilters={trackFilters}
                ></Lyrics>
                <Playlist
                  split={playlistSplit}
                  lyricsFullscreen={lyricsFullscreen}
                  trackFilters={trackFilters}
                  setTrackFilters={setTrackFilters}
                ></Playlist>
              </Split>
            </Split>
          </PlayerProvider>
        </DownloadProvider>
      </PlaylistProvider>

    </>
  )
}

export default App
