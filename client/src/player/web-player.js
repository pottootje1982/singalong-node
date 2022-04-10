import React, { useCallback, useContext, useEffect } from 'react'
import Script from 'react-load-script'
import { getCookie } from '../cookie'
import PlaylistContext from '../playlist/playlist-context'

export default function WebPlayer({ setPlayerState }) {
  const { setInitialized } = useContext(PlaylistContext)

  function handleScriptError(error) {
    console.log(error)
  }

  const handleScriptLoad = useCallback(() => {
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
      setInitialized('initialization_error')
    })
    player.addListener('authentication_error', ({ message }) => {
      console.error(message)
      setInitialized('authentication_error')
    })
    player.addListener('account_error', ({ message }) => {
      console.error(message)
      setInitialized('account_error')
    })
    player.addListener('playback_error', ({ message }) => {
      console.error(message)
      setInitialized('playback_error')
    })

    // Playback status updates
    player.addListener('player_state_changed', (state) => {
      setPlayerState(state)
    })

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)

      setInitialized(player)
    })

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
    })

    // Connect to the player!
    player.connect()
  }, [setInitialized, setPlayerState])

  useEffect(() => window.onSpotifyWebPlaybackSDKReady = handleScriptLoad, [handleScriptLoad])

  return (
    <Script
      url="https://sdk.scdn.co/spotify-player.js"
      onError={handleScriptError}
      onLoad={handleScriptLoad}
    />
  )
}
