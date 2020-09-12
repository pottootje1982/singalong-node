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
import { Search } from '@material-ui/icons'

export default function CustomSearch({
  trackFilters,
  track,
  downloadLyrics,
  closeMenu,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const artistRef = useRef(null)
  const titleRef = useRef(null)

  function doCustomSearch(artist, title) {
    downloadLyrics({ ...track, artist, title }, false)
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
          <Search fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Custom search" />
      </MenuItem>
      <Dialog open={modalOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>Search lyrics manually</DialogTitle>
        <DialogContent>
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <TextField
                label="Artist"
                fullWidth
                inputRef={artistRef}
                defaultValue={!trackFilters.hideArtist && track.artist}
              ></TextField>
            </Grid>
            <Grid item>
              <TextField
                label="Title"
                fullWidth
                inputRef={titleRef}
                defaultValue={track.getTitle(trackFilters.minimalTitle)}
              ></TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            autoFocus
            onClick={() =>
              doCustomSearch(artistRef.current.value, titleRef.current.value)
            }
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
