import React, { useEffect, useState, useContext } from 'react'
import { post } from '../server'
import {
  IconButton,
  Grid,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from '@material-ui/core'
import {
  GetApp as DownloadIcon,
  NavigateBefore,
  NavigateNext,
} from '@material-ui/icons'
import ToggleButton from '@material-ui/lab/ToggleButton'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { Track } from '../track'
import PlayerContext from '../lyrics/player-context'
import PlaylistContext from './playlist-context'
import { spotifyAxios } from '../server'
import usePlayTrack from '../lyrics/player-hooks'
import FilterContextMenu from './filter-context-menu'

const sleepTime = 3000

export default function PlaylistToolbar({
  trackFilters,
  setTrackFilters,
  selectTrackId,
  trackIdToDownload,
  setTrackIdToDownload,
  lyricsFullscreen,
}) {
  const { track, setTrack, trackId, setTrackId, tracks } = useContext(
    PlaylistContext
  )
  const {
    device,
    setDevice,
    player,
    setMonitorCurrentlyPlaying,
    isPlaying,
  } = useContext(PlayerContext)

  const [deviceOpen, setDeviceOpen] = useState(false)
  const [devices, setDevices] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [tracksToDownload, setTracksToDownload] = useState([])
  const mobile = !useMediaQuery('(min-width:600px)')
  const trackFound = tracks.find((t) => t.id === trackId)
  const playTrack = usePlayTrack()

  const getDevices = () => {
    if (player) {
      spotifyAxios.get('/me/player/devices').then(({ data: { devices } }) => {
        devices = devices || []
        setDevices(devices)
      })
    }
  }

  useEffect(getDevices, [player])

  function selectLastPlayingDevice() {
    const lastSelectedDeviceId = localStorage.getItem('lastPlayingDevice')
    const lastSelectedDevice = devices.find(
      (d) => d.id === lastSelectedDeviceId
    )
    setDevice(
      devices.find((d) => d.is_active) || lastSelectedDevice || devices[0]
    )
  }

  useEffect(selectLastPlayingDevice, [devices])

  function selectDevice() {
    if (device) spotifyAxios.put('/me/player', { device_ids: [device.id] })
  }

  useEffect(selectDevice, [device])

  function downloadTrack() {
    const toDownload = tracksToDownload[0]
    if (!toDownload) return
    setTrackIdToDownload(toDownload.id)
    sleep(trackIdToDownload ? sleepTime : 0).then(() => {
      if (isCancelled()) return
      const tail = tracksToDownload.slice(1)
      post('lyrics/download', {
        track: toDownload,
        sleepTime,
      }).then(({ data: { lyrics } }) => {
        if (lyrics) {
          setTrack(Track.copy({ ...toDownload, lyrics }))
        }
        if (isCancelled()) return
        if (isDownloading && tail.length > 0) setTracksToDownload(tail)
        else setTrackIdToDownload(null)
      })
    })
  }

  function isCancelled() {
    if (!isDownloading) {
      setTrackIdToDownload(null)
    }
    return !isDownloading
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  useEffect(downloadTracks, [isDownloading])

  function downloadTracks() {
    if (!isDownloading) {
      setTrackIdToDownload(null)
      setTracksToDownload([])
      return
    }
    setTracksToDownload(tracks.filter((track) => !track.lyrics))
  }

  function setAdjacentTrack(offset) {
    setMonitorCurrentlyPlaying(false)
    const index = tracks.indexOf(tracks.find((t) => t.id === trackId))
    const adjacentTrack = tracks[index + offset]
    if (adjacentTrack) setTrackId(adjacentTrack.id)
  }

  function onSelectTrack(_event, track) {
    selectTrackId(track)
    if (mobile && isPlaying && lyricsFullscreen && track.uri)
      playTrack(track.uri)
  }

  useEffect(downloadTrack, [tracksToDownload])

  return (
    <Grid container item spacing={1} alignItems="center">
      {!lyricsFullscreen && (
        <>
          <Grid item>
            <ToggleButton
              value="check"
              selected={isDownloading}
              onClick={() => setIsDownloading(!isDownloading)}
              style={{ width: 30, height: 30 }}
            >
              <DownloadIcon />
            </ToggleButton>
          </Grid>

          <Grid item>
            <FilterContextMenu
              setTrackFilters={setTrackFilters}
              trackFilters={trackFilters}
            />
          </Grid>
        </>
      )}

      {track && (
        <Grid
          item
          container
          xs
          style={{ minWidth: mobile ? 200 : 300 }}
          spacing={1}
        >
          <Grid item>
            <IconButton size="small" onClick={() => setAdjacentTrack(-1)}>
              <NavigateBefore />
            </IconButton>
          </Grid>

          <Grid item xs>
            <Autocomplete
              fullWidth
              value={track}
              onChange={onSelectTrack}
              autoHighlight
              options={track && trackFound ? tracks : []}
              noOptionsText=""
              getOptionLabel={(t) => t.toString(trackFilters)}
              getOptionSelected={(option, value) => option.id === trackId}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select track:"
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item>
            <IconButton size="small" onClick={() => setAdjacentTrack(1)}>
              <NavigateNext />
            </IconButton>
          </Grid>
        </Grid>
      )}

      {!(mobile && lyricsFullscreen) && device && (
        <Grid item>
          <FormControl variant="outlined" size="small">
            <InputLabel id="device-select">Device:</InputLabel>
            <Select
              labelId="device-select"
              open={deviceOpen}
              label="Device:"
              onClose={() => setDeviceOpen(false)}
              onOpen={() => setDeviceOpen(true)}
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              fullWidth
              style={{ width: 150 }}
            >
              {devices.map((d, i) => (
                <MenuItem key={i} value={d}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  )
}
