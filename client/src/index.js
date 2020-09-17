import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Authorize, { Authorized } from './authorize'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { PlayerProvider } from './lyrics/player-context'
import { PlaylistProvider } from './playlist/playlist-context'
import { LibraryProvider } from './library/library-context'

ReactDOM.render(
  <LibraryProvider>
    <PlaylistProvider>
      <PlayerProvider>
        <Router>
          <Route exact path="/">
            <Redirect to="/authorize"></Redirect>
          </Route>
          <Route path="/authorized" component={Authorized}></Route>
          <Route path="/authorize" component={Authorize}></Route>
          <Route path="/main" component={App}></Route>
        </Router>{' '}
      </PlayerProvider>
    </PlaylistProvider>
  </LibraryProvider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
