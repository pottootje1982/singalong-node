import React, { useContext } from 'react'
import { Menu, MenuItem } from '@material-ui/core'
import LibraryContext from '../library/library-context'
import { spotifyAxios } from '../server'

export default function AddToPlaylistMenu({ state, setState, initialState }) {
  const { playlists } = useContext(LibraryContext)

  const handleClose = () => {
    setState(initialState)
  }

  function addTrackToPlaylist(playlistUri) {
    const [, , id] = playlistUri.split(':')
    spotifyAxios
      .post(`/playlists/${id}/tracks`, {
        uris: [state.uri],
      })
      .then(console.log)
  }

  function onClick(playlistUri) {
    addTrackToPlaylist(playlistUri)
    handleClose()
  }

  return (
    <Menu
      keepMounted
      open={state.mouseY !== null}
      onClose={handleClose}
      id="simple-menu"
      anchorReference="anchorPosition"
      style={{ width: 600 }}
      anchorPosition={
        state.mouseY !== null && state.mouseX !== null
          ? { top: state.mouseY, left: state.mouseX }
          : undefined
      }
    >
      {playlists.map((p, i) => (
        <MenuItem key={i} onClick={() => onClick(p.uri)}>
          {p.name}
        </MenuItem>
      ))}
    </Menu>
  )
}
