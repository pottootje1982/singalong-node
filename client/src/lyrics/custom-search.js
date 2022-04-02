import React, { useRef, useContext } from 'react'
import { TextField } from '@material-ui/core'
import { Track } from '../track'

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
import PlaylistContext from '../playlist/playlist-context'
import DownloadContext from './download-context'

export function CustomSearchDialog({
  modalOpen,
  setModalOpen,
  trackFilters,
  closeMenu,
}) {
  const { track } = useContext(PlaylistContext)
  const artistRef = useRef(null)
  const titleRef = useRef(null)

  function doCustomSearch(artist, title) {
    closeMenu()
    downloadTrack({ ...track, artist, title }, { save: false }).then(lyrics => { if (!lyrics) alert(`Could not find lyrics for ${track.toString()}`) })
    closeDialog()
  }
  const { downloadTrack } = useContext(DownloadContext)

  function closeDialog() {
    setModalOpen(false)
    closeMenu()
  }

  const trackToDisplay = track || new Track({})

  return (
    <>
      <Dialog open={modalOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>Search lyrics manually</DialogTitle>
        <DialogContent>
          <Grid container direction="column" alignItems="stretch">
            <Grid item>
              <TextField
                label="Artist"
                fullWidth
                inputRef={artistRef}
                defaultValue={!trackFilters.hideArtist && trackToDisplay.artist}
              ></TextField>
            </Grid>
            <Grid item>
              <TextField
                label="Title"
                fullWidth
                inputRef={titleRef}
                defaultValue={trackToDisplay.getTitle(
                  trackFilters.minimalTitle
                )}
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

export default function CustomSearch({
  setModalOpen
}) {
  return (
    <>
      <MenuItem onClick={() => setModalOpen(true)}>
        <ListItemIcon>
          <Search fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Custom search" />
      </MenuItem>
    </>
  )
}
