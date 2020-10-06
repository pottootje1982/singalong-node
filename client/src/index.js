import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Authorize, { Authorized } from './authorize'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { PlayerProvider } from './player/player-context'
import { PlaylistProvider } from './playlist/playlist-context'
import { LibraryProvider } from './library/library-context'
import { ThemeProvider } from './theme-context'

ReactDOM.render(
  <LibraryProvider>
    <ThemeProvider>
      <PlaylistProvider>
        <PlayerProvider>
          <Router>
            <Route path="/authorized" component={Authorized}></Route>
            <Route exact path="/authorize" component={Authorize}></Route>
            <Route path="/" component={App}></Route>
          </Router>
        </PlayerProvider>
      </PlaylistProvider>
    </ThemeProvider>
  </LibraryProvider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
