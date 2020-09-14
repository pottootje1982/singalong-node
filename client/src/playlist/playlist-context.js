import React, { useState, createContext } from 'react'

const PlaylistContext = createContext()

export default PlaylistContext

export function PlaylistProvider(props) {
  const [playlist, setPlaylist] = useState()
  const [radio, setRadio] = useState()
  const [track, setTrack] = useState()
  const [trackId, setTrackId] = useState('')

  const values = {
    playlist,
    setPlaylist,
    radio,
    setRadio,
    track,
    setTrack,
    trackId,
    setTrackId,
  }

  return (
    <PlaylistContext.Provider value={values}>
      {props.children}
    </PlaylistContext.Provider>
  )
}
