import React, { useState, useEffect } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'
import Lyrics from './lyrics'

import { Grid } from '@material-ui/core'
import qs from 'qs'
import server from './server'

function App({ location }) {
  const [playlist, setPlaylist] = useState()
  const [user, setUser] = useState()
  const query = location.search
  const { token } = qs.parse(query, { ignoreQueryPrefix: true })

  useEffect(() => {
    server.get('/v2/authorize/me').then((res) => {
      setUser(res.data.body.id)
    })
  }, [])

  window.history.pushState('', '', '/main')
  return (
    <div className="App">
      <header className="App-header">
        {token && (
          <Grid container>
            <Grid item>
              <Playlists setPlaylist={setPlaylist} token={token}></Playlists>
            </Grid>
            <Grid item>
              <div>
                <Lyrics></Lyrics>
                <Playlist
                  playlist={playlist}
                  token={token}
                  user={user}
                ></Playlist>
              </div>
            </Grid>
          </Grid>
        )}
      </header>
    </div>
  )
}

export default App
