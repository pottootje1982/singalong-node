import React, { useState, useEffect, createContext } from 'react'

const PlayerContext = createContext()

export default PlayerContext

export function PlayerProvider(props) {
  const [player, setPlayer] = useState()
  const [isPlaying, setIsPlaying] = useState()
  const [monitorCurrentlyPlaying, setMonitorCurrentlyPlaying] = useState(true)
  const [device, setDevice] = useState(
    localStorage.getItem('lastPlayingDevice')
  )
  const [currentlyPlaying, setCurrentlyPlaying] = useState()
  const [playerState, setPlayerState] = useState()

  function storeDevice() {
    if (device) localStorage.setItem('lastPlayingDevice', device)
  }

  useEffect(storeDevice, [device])

  const values = {
    isPlaying,
    setIsPlaying,
    monitorCurrentlyPlaying,
    setMonitorCurrentlyPlaying,
    device,
    setDevice,
    currentlyPlaying,
    setCurrentlyPlaying,
    player,
    setPlayer,
    playerState,
    setPlayerState,
  }

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  )
}
