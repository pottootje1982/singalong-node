import React, { useState, createContext, useEffect
 } from 'react'
import { useLocation } from 'react-router-dom'

const PlaylistContext = createContext()

export default PlaylistContext

export function getPlaylist(location) {
  const [, urlRadio] = location.pathname.match(/radio\/(.*)/) || []
  const [, urlPlaylist] = location.pathname.match(/playlist\/(.*)/) || []
  const [, urlCurrentlyPlaying] = location.pathname.match(/currently-playing\/(.*)/) || []
  const [, urlCustomPlaylist] =
    location.pathname.match(/custom-playlist\/(.*)/) || []
  return {
    urlRadio,
    urlPlaylist:
      urlPlaylist && urlPlaylist.replace(/spotify:user:\d+/, 'spotify'),
    urlCustomPlaylist,
    urlCurrentlyPlaying:
      urlCurrentlyPlaying && urlCurrentlyPlaying.replace(/spotify:user:\d+/, 'spotify'),
  }
}

export function PlaylistProvider(props) {
  const location = useLocation()

  const {urlPlaylist, urlRadio, urlCustomPlaylist, urlCurrentlyPlaying} = getPlaylist(location)

  const [initialized, setInitialized] = useState()
  const [playlist, setPlaylist] = useState(urlPlaylist)
  const [radio, setRadio] = useState(urlRadio)
  const [customPlaylist, setCustomPlaylist] = useState(urlCustomPlaylist)
  const [track, setTrack] = useState()
  const [trackId, setTrackId] = useState('')
  const [tracks, setTracks] = useState()

  useEffect(init, [location, initialized])

  function init() {
    if (initialized) {
      setPlaylist(null)
      setCustomPlaylist(null)
      setRadio(null)
      setTrackId(null)
      if (urlRadio) setRadio({ urlRadio })
      else if (urlCustomPlaylist) setCustomPlaylist(urlCustomPlaylist)
      else setPlaylist(urlCurrentlyPlaying || urlPlaylist)
    }
  }

  const values = {
    playlist,
    radio,
    customPlaylist,
    track,
    setTrack,
    trackId,
    setTrackId,
    tracks: tracks || [],
    tracksInitialized: tracks !== undefined,
    setTracks,
    initialized,
    setInitialized
  }

  return (
    <PlaylistContext.Provider value={values}>
      {props.children}
    </PlaylistContext.Provider>
  )
}
