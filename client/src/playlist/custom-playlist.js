import React, { useRef, useState, useContext } from 'react'
import { TextField } from '@material-ui/core'

import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'
import { List, Edit } from '@material-ui/icons'
import ServerContext from '../server-context'
import PlaylistContext from './playlist-context'
import LibraryContext from '../library/library-context'
import { Track } from '../track'

export default function CustomPlaylist({ closeMenu, edit }) {
  const { server } = useContext(ServerContext)
  const [modalOpen, setModalOpen] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const nameref = useRef(null)
  const playlistref = useRef(null)
  const { tracks, setTracks, customPlaylist: id } = useContext(PlaylistContext)
  const { customPlaylists, setCustomPlaylists } = useContext(LibraryContext)
  const customPlaylist = customPlaylists.find((p) => p.id === id)

  async function addOrEditCustomPlaylist(tracksString, name) {
    let playlist
    if (edit) {
      const { data } = await server.put('/api/playlists/custom', {
        id: id,
        tracksString,
        name,
      })
      playlist = data.playlist
      customPlaylist.name = playlist.name
      customPlaylist.tracks = playlist.tracks
      setCustomPlaylists([...customPlaylists])
    } else {
      const { data } = await server.post('/api/playlists/custom', {
        tracksString,
        name,
      })
      playlist = data.playlist
      setCustomPlaylists([...customPlaylists, playlist])
    }
    setTracks(playlist.tracks.map(Track.copy))

    closeDialog()
  }

  function closeDialog() {
    setModalOpen(false)
    closeMenu()
  }

  function validateInputs() {
    setIsValid(
      nameref.current.value.trim() !== '' &&
        playlistref.current.value.trim() !== ''
    )
  }

  const title = `${edit ? 'Edit' : 'Add'} Custom playlist`

  return !edit || id ? (
    <>
      <MenuItem onClick={() => setModalOpen(true)}>
        <ListItemIcon>
          {edit ? <Edit fontSize="small" /> : <List fontSize="small" />}
        </ListItemIcon>
        <ListItemText primary={title} />
      </MenuItem>
      <Dialog open={modalOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <TextField
                label="Playlist name"
                fullWidth
                onChange={validateInputs}
                inputRef={nameref}
                defaultValue={customPlaylist && customPlaylist.name}
              ></TextField>
            </Grid>
            <Grid item>
              <TextField
                label="Playlist (Artist - title)"
                fullWidth
                multiline
                rows={18}
                onChange={validateInputs}
                defaultValue={
                  edit && tracks.map((t) => t.toString()).join('\n')
                }
                inputRef={playlistref}
              ></TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            autoFocus
            disabled={!isValid}
            onClick={() =>
              addOrEditCustomPlaylist(
                playlistref.current.value,
                nameref.current.value
              )
            }
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  ) : (
    <></>
  )
}
