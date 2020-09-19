import React, { useState, useEffect, createContext } from 'react'

const PlayerContext = createContext()

export default PlayerContext

export function PlayerProvider(props) {
  const [player, setPlayer] = useState()
  const [isPlaying, setIsPlaying] = useState()
  const [monitorCurrentlyPlaying, setMonitorCurrentlyPlaying] = useState(true)
  const [device, setDevice] = useState()
  const [currentlyPlaying, setCurrentlyPlaying] = useState()
  const [playPosition, setPlayPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  function storeDevice() {
    if (device) localStorage.setItem('lastPlayingDevice', device.id)
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
  }

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  )
}
