import React, { useState, useEffect, useRef } from 'react'
import { TextField, IconButton, Tooltip } from '@material-ui/core'
import { get, post, del } from '../server'
import {
  Grid,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'
import {
  Fullscreen,
  FullscreenExit,
  Menu as MenuIcon,
  GetApp as DownloadIcon,
  QueueMusic,
  Delete,
  Save,
  Search,
  SkipPrevious,
  SkipNext,
} from '@material-ui/icons'
import CheckMenuItem from '../CheckMenuItem'
import { Track } from '../track'

export default function Lyrics({
  track,
  setPlaylist,
  setTrack,
  setTrackId,
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
}) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const lyricsRef = useRef(null)
  const artistRef = useRef(null)
  const titleRef = useRef(null)
  const [lyrics, setLyrics] = useState()
  const [anchorEl, setAnchorEl] = useState()
  const [modalOpen, setModalOpen] = useState(false)

  function setOrClearProbe() {
    closeMenu()
    if (showCurrentlyPlaying) {
      const probe = setInterval(showCurrentlyPlayingTrack, 2000)
      setCurrentlyPlayingProbe(probe)
    } else {
      clearInterval(currentlyPlayingProbe)
    }
  }

  useEffect(setOrClearProbe, [showCurrentlyPlaying])

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track])

  function showCurrentlyPlayingTrack() {
    get('/player').then(({ data: { track, uri } }) => {
      if (track) {
        setPlaylist(uri)
        setTrackId(track.id)
      }
    })
  }

  function saveLyrics(track) {
    const lyrics = lyricsRef.current.value
    post('/lyrics', { track, lyrics })
    track.lyrics = lyrics
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function removeLyrics(track) {
    track.lyrics = null
    del('/lyrics', { data: { track } })
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function closeMenu() {
    setAnchorEl(null)
  }

  function downloadLyrics(track, save) {
    post('lyrics/download', { track, getCached: false, save }).then(
      ({ data: { lyrics } }) => {
        closeMenu()
        if (lyrics) {
          track.lyrics = lyrics
          setTrack(Track.copy({ ...track, lyrics }))
        }
      }
    )
  }

  function searchLyrics(track) {
    const artist = trackFilters.hideArtist ? '' : `${track.artist}+`
    const title = track.getTitle(trackFilters)
    const query = `${artist}${title}`.replace('&', '')
    window.open(`https://www.google.com/search?q=${query}+lyrics`, '_blank')
    closeMenu()
  }

  function skipTrack(command) {
    post('player', { command })
  }

  function doCustomSearch(artist, title) {
    downloadLyrics({ ...track, artist, title }, false)
    setModalOpen(false)
  }

  track = track || new Track({})
  return (
    <Grid container spacing={1} direction="column" alignItems="stretch">
      <Grid container item alignItems="center" spacing={1}>
        <Grid item>
          <IconButton
            size="small"
            onClick={() => setLyricsFullscreen(!lyricsFullscreen)}
          >
            {lyricsFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Grid>
        <Grid item>
          <Tooltip
            title="Show currently playing track on Spotify"
            aria-label="add"
          >
            <IconButton
              size="small"
              onClick={() => showCurrentlyPlayingTrack()}
            >
              <QueueMusic />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item>
          <IconButton
            size="small"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            label="label"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            getContentAnchorEl={null}
            anchorEl={anchorEl}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            open={!!anchorEl}
            onClose={closeMenu}
          >
            <CheckMenuItem
              setter={setShowCurrentlyPlaying}
              checked={showCurrentlyPlaying}
              name="Monitor currently playing track"
              close={closeMenu}
            />

            <MenuItem onClick={() => downloadLyrics(track)}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Download current track" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => saveLyrics(track)}>
              <ListItemIcon>
                <Save fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Save" />
            </MenuItem>
            <MenuItem onClick={() => removeLyrics(track)}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Remove" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => searchLyrics(track)}>
              <ListItemIcon>
                <Search fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Search with Google" />
            </MenuItem>
            <MenuItem onClick={() => setModalOpen(true)}>
              <ListItemIcon>
                <Search fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Custom search" />
            </MenuItem>
          </Menu>
        </Grid>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth>
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
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
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
        <Grid item style={{ marginLeft: 20 }}>
          <IconButton size="small" onClick={() => skipTrack('previous')}>
            <SkipPrevious />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton size="small" onClick={() => skipTrack('next')}>
            <SkipNext />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          key={lyrics}
          fullWidth
          inputRef={lyricsRef}
          id="outlined-multiline-static"
          filters={trackFilters}
          label={`Lyrics ${track.toString(trackFilters)}`}
          multiline
          rows={!lyricsFullscreen ? 18 : undefined}
          defaultValue={lyrics}
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}
