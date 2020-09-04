import React, { useState, useEffect } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'
import Lyrics from './lyrics'

import { Grid } from '@material-ui/core'
import qs from 'qs'
import { get } from './server'

function App({ location }) {
  const [playlist, setPlaylist] = useState()
  const [track, setTrack] = useState({})
  const [trackId, setTrackId] = useState('')
  const [user, setUser] = useState()
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false)
  const query = location.search
  const { token } = qs.parse(query, { ignoreQueryPrefix: true })

  useEffect(() => {
    get('/authorize/me').then((res) => {
      setUser(res.data.body.id)
    })
  }, [])

  window.history.pushState('', '', '/main')
  return token || user ? (
    <Grid
      container
      spacing={1}
      style={{
        margin: 0,
        width: '100%',
      }}
    >
      <Grid item xs={3} style={{ display: lyricsFullscreen && 'none' }}>
        <Playlists
          setPlaylist={setPlaylist}
          playlist={playlist}
          user={user}
          token={token}
        ></Playlists>
      </Grid>
      <Grid item xs={lyricsFullscreen ? 12 : 8}>
        <Grid container direction="column" spacing={1} alignItems="stretch">
          <Grid item>
            <Lyrics
              track={track}
              setTrack={setTrack}
              setTrackId={setTrackId}
              setPlaylist={setPlaylist}
              lyricsFullscreen={lyricsFullscreen}
              setLyricsFullscreen={setLyricsFullscreen}
            ></Lyrics>
          </Grid>
          <Grid item style={{ display: lyricsFullscreen && 'none' }}>
            <Playlist
              key={playlist}
              playlist={playlist}
              token={token}
              user={user}
              track={track}
              trackId={trackId}
              setTrackId={setTrackId}
              setTrack={setTrack}
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
