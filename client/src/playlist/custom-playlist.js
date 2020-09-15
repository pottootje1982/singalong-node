import React, { useRef, useState } from 'react'
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
import { List } from '@material-ui/icons'
import { post } from '../server'

export default function CustomPlaylist({ closeMenu }) {
  const [modalOpen, setModalOpen] = useState(false)
  const nameref = useRef(null)
  const playlistref = useRef(null)

  function sendCustomPlaylist(playlist, name) {
    post('/playlists', { playlist, name })
    closeDialog()
  }

  function closeDialog() {
    setModalOpen(false)
    closeMenu()
  }

  return (
    <>
      <MenuItem onClick={() => setModalOpen(true)}>
        <ListItemIcon>
          <List fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Custom playlist" />
      </MenuItem>
      <Dialog open={modalOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>Add custom playlist</DialogTitle>
        <DialogContent>
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <TextField
                label="Playlist name"
                fullWidth
                inputRef={nameref}
              ></TextField>
            </Grid>
            <Grid item>
              <TextField
                label="Playlist (Artist - title)"
                fullWidth
                multiline
                rows={18}
                inputRef={playlistref}
              ></TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            autoFocus
            onClick={() =>
              sendCustomPlaylist(
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
  )
}
