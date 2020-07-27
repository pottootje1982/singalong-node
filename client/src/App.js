import React, { useState } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'

import { Grid } from '@material-ui/core'
import qs from 'qs'

function App({ location }) {
  const [playlist, setPlaylist] = useState()
  const query = location.search
  const { token } = qs.parse(query, { ignoreQueryPrefix: true })

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
              <Playlist playlist={playlist} token={token}></Playlist>
            </Grid>
          </Grid>
        )}
      </header>
    </div>
  )
}

export default App
