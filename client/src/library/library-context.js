import React, { useState, createContext } from 'react'

const LibraryContext = createContext()

export default LibraryContext

export function LibraryProvider(props) {
  const [playlists, setPlaylists] = useState([])
  const [customPlaylists, setCustomPlaylists] = useState([])

  const values = {
    playlists,
    setPlaylists,
    customPlaylists,
    setCustomPlaylists,
  }

  return (
    <LibraryContext.Provider value={values}>
      {props.children}
    </LibraryContext.Provider>
  )
}
