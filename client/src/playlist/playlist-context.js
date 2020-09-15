import React, { useState, createContext } from 'react'

const PlaylistContext = createContext()

export default PlaylistContext

export function PlaylistProvider(props) {
  const [playlist, setPlaylist] = useState()
  const [radio, setRadio] = useState()
  const [customPlaylist, setCustomPlaylist] = useState()
  const [track, setTrack] = useState()
  const [trackId, setTrackId] = useState('')
  const [tracks, setTracks] = useState([])

  const values = {
    playlist,
    setPlaylist,
    radio,
    setRadio,
    customPlaylist,
    setCustomPlaylist,
    track,
    setTrack,
    trackId,
    setTrackId,
    tracks,
    setTracks,
  }

  return (
    <PlaylistContext.Provider value={values}>
      {props.children}
    </PlaylistContext.Provider>
  )
}
