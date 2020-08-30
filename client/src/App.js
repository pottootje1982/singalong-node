import React, { useState, useEffect } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'
import Lyrics from './lyrics'

import { Grid } from '@material-ui/core'
import qs from 'qs'
import { get } from './server'

function App({ location }) {
  const [playlist, setPlaylist] = useState()
  const [track, setTrack] = useState('')
  const [trackId, setTrackId] = useState('')
  const [user, setUser] = useState()
  const query = location.search
  const { token } = qs.parse(query, { ignoreQueryPrefix: true })
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    get('/v2/authorize/me').then((res) => {
      setUser(res.data.body.id)
    })
  }, [])

  function refreshTracks() {
    setTracks([...tracks])
  }

  window.history.pushState('', '', '/main')
  return (
    <div className="App">
      <header className="App-header">
        {(token || user) && (
          <Grid container>
            <Grid item xs={4}>
              <Playlists
                setPlaylist={setPlaylist}
                playlist={playlist}
                user={user}
                token={token}
              ></Playlists>
            </Grid>
            <Grid item xs={8}>
              <Grid container direction="column">
                <Grid item>
                  <Lyrics
                    track={track}
                    setTrackId={setTrackId}
                    refreshTracks={refreshTracks}
                  ></Lyrics>
                </Grid>
                <Grid item>
                  <Playlist
                    key={playlist}
                    playlist={playlist}
                    token={token}
                    user={user}
                    trackId={trackId}
                    track={track}
                    setTrack={setTrack}
                    tracks={tracks}
                    setTracks={setTracks}
                  ></Playlist>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </header>
    </div>
  )
}

export default App
