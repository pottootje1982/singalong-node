import React, { useState, useEffect } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'
import Lyrics from './lyrics'
import { Grid, useMediaQuery } from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import { getCookie, setCookie } from './cookie'
import { get } from './server'

function App() {
  const [playlist, setPlaylist] = useState()
  const [radio, setRadio] = useState()
  const [track, setTrack] = useState()
  const [trackId, setTrackId] = useState('')
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const [token, setToken] = useState(getCookie('accessToken'))
  const mobile = !useMediaQuery('(min-width:600px)')

  const [trackFilters, setTrackFilters] = useState({
    minimalTitle: true,
    isNotDownloaded: false,
    hideArtist: false,
  })

  function refreshToken() {
    if (!token) {
      get('/authorize/refresh', {
        refreshToken: getCookie('refreshToken'),
      }).then(({ data: { accessToken } }) => {
        if (accessToken) {
          setCookie('accessToken', accessToken, 1)
          setToken(accessToken)
        } else {
          setToken('redirect')
        }
      })
    }
  }

  useEffect(refreshToken, [])

  if (token === 'redirect') {
    return <Redirect to={'/authorize'} />
  }

  window.history.pushState('', '', '/main')
  return token ? (
    <Grid
      container
      spacing={1}
      style={{
        margin: 0,
        width: '98%',
      }}
    >
      <Grid item xs style={{ display: lyricsFullscreen && 'none' }}>
        <Playlists
          setPlaylist={setPlaylist}
          setRadio={setRadio}
          playlist={playlist}
          token={token}
          setTrackId={setTrackId}
        ></Playlists>
      </Grid>
      <Grid item xs={lyricsFullscreen || mobile ? 12 : 8}>
        <Grid
          container
          direction={mobile || lyricsFullscreen ? 'column-reverse' : 'column'}
          spacing={1}
          alignItems="stretch"
        >
          <Grid item>
            <Lyrics
              track={track}
              setTrack={setTrack}
              setTrackId={setTrackId}
              setPlaylist={setPlaylist}
              lyricsFullscreen={lyricsFullscreen}
              setLyricsFullscreen={setLyricsFullscreen}
              trackFilters={trackFilters}
            ></Lyrics>
          </Grid>
          <Grid item>
            <Playlist
              lyricsFullscreen={lyricsFullscreen}
              playlist={playlist}
              radio={radio}
              token={token}
              track={track}
              trackId={trackId}
              setTrackId={setTrackId}
              setTrack={setTrack}
              trackFilters={trackFilters}
              setTrackFilters={setTrackFilters}
            ></Playlist>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <React.Fragment />
  )
}

export default App
