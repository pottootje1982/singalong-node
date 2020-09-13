import React, { useState, createContext } from 'react'

const PlayerContext = createContext()

export default PlayerContext

export function PlayerProvider(props) {
  const [playPosition, setPlayPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState()

  const values = { playPosition, setPlayPosition, isPlaying, setIsPlaying }

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  )
}
