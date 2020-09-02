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
  const query = location.search
  const { token } = qs.parse(query, { ignoreQueryPrefix: true })

  useEffect(() => {
    get('/v2/authorize/me').then((res) => {
      setUser(res.data.body.id)
    })
  }, [])

  window.history.pushState('', '', '/main')
  return (
    <div className="App">
      <header className="App-header">
        {(token || user) && (
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Playlists
                setPlaylist={setPlaylist}
                playlist={playlist}
                user={user}
                token={token}
              ></Playlists>
            </Grid>
            <Grid item xs={8}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <Lyrics
                    track={track}
                    setTrack={setTrack}
                    setTrackId={setTrackId}
                    setPlaylist={setPlaylist}
                  ></Lyrics>
                </Grid>
                <Grid item>
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
        )}
      </header>
    </div>
  )
}

export default App
