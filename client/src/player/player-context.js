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
  const [playPosition, setPlayPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState()
  const [lastPlayPosition, setLastPlayPosition] = useState()

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
    playPosition,
    setPlayPosition,
    duration,
    setDuration,
    lastUpdateTime,
    setLastUpdateTime,
    lastPlayPosition,
    setLastPlayPosition,
  }

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  )
}
