import React, { useState, useEffect, useRef } from 'react'
import { TextField, Checkbox, Fab, Tooltip } from '@material-ui/core'
import { get, post, del } from '../server'
import { Grid, Menu, MenuItem, Divider } from '@material-ui/core'
import {
  ChevronRight,
  ChevronLeft,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Menu as MenuIcon,
  GetApp as DownloadIcon,
  QueueMusic,
} from '@material-ui/icons'

export default function Lyrics({
  track,
  setPlaylist,
  setTrack,
  setTrackId,
  hidePlaylists,
  setHidePlaylists,
  hidePlaylist,
  setHidePlaylist,
}) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const [sites, setSites] = useState({})
  const lyricsRef = useRef(null)
  const [lyrics, setLyrics] = useState()
  const [anchorEl, setAnchorEl] = useState()

  function setOrClearProbe() {
    if (showCurrentlyPlaying) {
      const probe = setInterval(showCurrentlyPlaying, 2000)
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
    setAnchorEl(null)
  }

  function removeLyrics(track) {
    track.lyrics = null
    del('/lyrics', { data: { track } })
    setTrack({ ...track })
    setAnchorEl(null)
  }

  function downloadLyrics(track, site) {
    post('lyrics/download', { track, site }).then(({ data: { lyrics } }) => {
      setAnchorEl(null)
      if (lyrics) {
        track.lyrics = lyrics
        setTrack({ ...track })
      }
    })
  }

  track = track || {}
  const label = track.artist ? ` ${track.artist} - ${track.title}` : ''
  return (
    <Grid container spacing={1} alignItems="stretch">
      <Grid container item alignItems="center" spacing={1}>
        <Grid item>
          <Fab size="small" onClick={() => setHidePlaylists(!hidePlaylists)}>
            {hidePlaylists ? <ChevronRight /> : <ChevronLeft />}
          </Fab>
        </Grid>
        <Grid item>
          <Tooltip
            title="Monitor currently playing track on Spotify"
            aria-label="add"
          >
            <Checkbox
              color="primary"
              onChange={(_e, checked) => setShowCurrentlyPlaying(checked)}
            />
          </Tooltip>
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
          <Tooltip title="Download current track" aria-label="add">
            <Fab size="small" onClick={() => downloadLyrics(track)}>
              <DownloadIcon />
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
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(null)
            }}
          >
            {Object.entries(sites).map(([key, engine]) => (
              <MenuItem key={key} onClick={() => downloadLyrics(track, key)}>
                {engine.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => saveLyrics(track)}>Save</MenuItem>
            <MenuItem onClick={() => removeLyrics(track)}>Remove</MenuItem>
          </Menu>
        </Grid>
      </Grid>
      <Grid container item alignItems="flex-end" direction="row" spacing={1}>
        <Grid item xs={10}>
          <TextField
            key={lyrics}
            fullWidth
            inputRef={lyricsRef}
            id="outlined-multiline-static"
            label={`Lyrics${label}`}
            multiline
            rows={!hidePlaylist && 18}
            defaultValue={lyrics}
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Fab size="small" onClick={() => setHidePlaylist(!hidePlaylist)}>
            {hidePlaylist ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </Fab>
        </Grid>
      </Grid>
    </Grid>
  )
}
