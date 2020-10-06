import React, { useContext, useEffect } from 'react'
import Script from 'react-load-script'
import { getCookie } from '../cookie'

import PlayerContext from './player-context'

export default function WebPlayer({ setPlayerState }) {
  const { setPlayer } = useContext(PlayerContext)

  function init() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      handleScriptLoad()
    }
  }
  useEffect(init, [])

  function handleScriptError(error) {
    console.log(error)
  }

  function handleScriptLoad() {
    const token = getCookie('accessToken')
    if (!window.Spotify) return
    const player = new window.Spotify.Player({
      // Spotify is not defined until
      name: 'Spotify Web Player', // the script is loaded in
      getOAuthToken: (cb) => {
        cb(token)
      },
    })

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
      console.error(message)
      setPlayer('initialization_error')
    })
    player.addListener('authentication_error', ({ message }) => {
      console.error(message)
      setPlayer('authentication_error')
    })
    player.addListener('account_error', ({ message }) => {
      console.error(message)
      setPlayer('account_error')
    })
    player.addListener('playback_error', ({ message }) => {
      console.error(message)
      setPlayer('playback_error')
    })

    // Playback status updates
    player.addListener('player_state_changed', (state) => {
      setPlayerState(state)
    })

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)

      setPlayer(player)
    })

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
    })

    // Connect to the player!
    player.connect()
  }

  return (
    <Script
      url="https://sdk.scdn.co/spotify-player.js"
      onError={handleScriptError}
      onLoad={handleScriptLoad}
    />
  )
}
