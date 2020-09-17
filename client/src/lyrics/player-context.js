import React, { useState, useEffect, createContext } from 'react'
import { setCookie } from '../cookie'

const PlayerContext = createContext()

export default PlayerContext

export function PlayerProvider(props) {
  const [playPosition, setPlayPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState()
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [device, setDevice] = useState()

  function storeDevice() {
    if (device) setCookie('lastPlayingDevice', device.id)
  }

  useEffect(storeDevice, [device])

  const values = {
    playPosition,
    setPlayPosition,
    isPlaying,
    setIsPlaying,
    showCurrentlyPlaying,
    setShowCurrentlyPlaying,
    device,
    setDevice,
  }

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  )
}
