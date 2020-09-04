import React, { useState, useEffect, useRef } from 'react'
import { TextField, Fab, Tooltip } from '@material-ui/core'
import { get, post, del } from '../server'
import {
  Grid,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
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
  CheckBoxOutlineBlank,
  CheckBoxOutlined,
  SkipPrevious,
  SkipNext,
} from '@material-ui/icons'

export default function Lyrics({
  track,
  setPlaylist,
  setTrack,
  setTrackId,
  lyricsFullscreen,
  setLyricsFullscreen,
}) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const [sites, setSites] = useState({})
  const lyricsRef = useRef(null)
  const [lyrics, setLyrics] = useState()
  const [anchorEl, setAnchorEl] = useState()

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

  useEffect(getSites, [])

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

  function getSites() {
    get('/lyrics/sites').then(({ data: { sites } }) => {
      setSites(sites || {})
    })
  }

  function saveLyrics(track) {
    const lyrics = lyricsRef.current.value
    post('/lyrics', { track, lyrics })
    track.lyrics = lyrics
    setTrack({ ...track })
    closeMenu()
  }

  function removeLyrics(track) {
    track.lyrics = null
    del('/lyrics', { data: { track } })
    setTrack({ ...track })
    closeMenu()
  }

  function closeMenu() {
    setAnchorEl(null)
  }

  function downloadLyrics(track, site) {
    post('lyrics/download', { track, site }).then(({ data: { lyrics } }) => {
      closeMenu()
      if (lyrics) {
        track.lyrics = lyrics
        setTrack({ ...track })
      }
    })
  }

  function searchLyrics(track) {
    window.open(
      `https://www.google.com/search?q=${track.artist}+${track.title}+lyrics`,
      '_blank'
    )
    closeMenu()
  }

  function skipTrack(direction) {
    get('player/skip-track', { params: { direction } })
  }

  track = track || {}
  const label = track.artist ? ` ${track.artist} - ${track.title}` : ''
  return (
    <Grid container spacing={1} direction="column" alignItems="stretch">
      <Grid container item alignItems="center" spacing={1}>
        <Grid item>
          <Fab
            size="small"
            onClick={() => setLyricsFullscreen(!lyricsFullscreen)}
          >
            {lyricsFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </Fab>
        </Grid>
        <Grid item>
          <Tooltip
            title="Show currently playing track on Spotify"
            aria-label="add"
          >
            <Fab size="small" onClick={() => showCurrentlyPlayingTrack()}>
              <QueueMusic />
            </Fab>
          </Tooltip>
        </Grid>

        <Grid item>
          <Fab
            size="small"
            onClick={(event) => setAnchorEl(event.target)}
            label="label"
          >
            <MenuIcon />
          </Fab>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => {
              closeMenu()
            }}
          >
            <MenuItem
              onClick={() => setShowCurrentlyPlaying(!showCurrentlyPlaying)}
            >
              <ListItemIcon>
                {showCurrentlyPlaying ? (
                  <CheckBoxOutlined />
                ) : (
                  <CheckBoxOutlineBlank />
                )}
              </ListItemIcon>
              <ListItemText primary="Monitor currently playing track" />
            </MenuItem>
            <MenuItem onClick={() => downloadLyrics(track)}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Download current track" />
            </MenuItem>
            <Divider />
            {Object.entries(sites).map(([key, engine]) => (
              <MenuItem key={key} onClick={() => downloadLyrics(track, key)}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={engine.name} />
              </MenuItem>
            ))}
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
          </Menu>
        </Grid>
        <Grid item style={{ marginLeft: 20 }}>
          <Fab size="small" onClick={() => skipTrack('previous')}>
            <SkipPrevious />
          </Fab>
        </Grid>
        <Grid item>
          <Fab size="small" onClick={() => skipTrack('next')}>
            <SkipNext />
          </Fab>
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          key={lyrics}
          fullWidth
          inputRef={lyricsRef}
          id="outlined-multiline-static"
          label={`Lyrics${label}`}
          multiline
          rows={!lyricsFullscreen ? 18 : undefined}
          defaultValue={lyrics}
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}
