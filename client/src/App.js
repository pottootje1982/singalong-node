import React, { useState } from 'react'
import Playlists from './playlists'
import Playlist from './playlist'

import { Grid } from '@material-ui/core'

function App() {
  const [playlist, setPlaylist] = useState()

  return (
    <div className="App">
      <header className="App-header">
        <Grid container>
          <Grid item>
            <Playlists setPlaylist={setPlaylist}></Playlists>
          </Grid>
          <Grid item>
            <Playlist playlist={playlist}></Playlist>
          </Grid>
        </Grid>
      </header>
    </div>
  )
}

export default App
