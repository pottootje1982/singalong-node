import React, { useState, createContext } from 'react'

const PlaylistContext = createContext()

export default PlaylistContext

export function getPlaylist() {
  const [, urlRadio] = window.location.pathname.match(/radio\/(.*)/) || []
  const [, urlPlaylist] = window.location.pathname.match(/playlist\/(.*)/) || []
  const [, urlCustomPlaylist] =
    window.location.pathname.match(/custom-playlist\/(.*)/) || []
  return {
    urlRadio,
    urlPlaylist:
      urlPlaylist && urlPlaylist.replace(/spotify:user:\d+/, 'spotify'),
    urlCustomPlaylist,
  }
}

export function PlaylistProvider(props) {
  const { urlPlaylist, urlRadio, urlCustomPlaylist } = getPlaylist()
  const [playlist, setPlaylist] = useState(urlPlaylist)
  const [radio, setRadio] = useState(urlRadio)
  const [customPlaylist, setCustomPlaylist] = useState(urlCustomPlaylist)
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
