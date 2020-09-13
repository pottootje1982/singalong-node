import React, { useEffect, useState } from 'react'
import { get, post } from '../server'
import {
  Menu,
  IconButton,
  Grid,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from '@material-ui/core'
import CheckMenuItem from '../CheckMenuItem'
import { GetApp as DownloadIcon, Menu as MenuIcon } from '@material-ui/icons'
import ToggleButton from '@material-ui/lab/ToggleButton'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Player from './player'
import { Track } from '../track'

const sleepTime = 3000

export default function PlaylistToolbar({
  trackFilters,
  setDevice,
  setTrackFilters,
  track,
  setTrack,
  trackId,
  selectTrackId,
  tracks,
  device,
  trackIdToDownload,
  setTrackIdToDownload,
  lyricsFullscreen,
  playPosition,
  playlist,
  radio,
}) {
  const [anchorEl, setAnchorEl] = useState()
  const [deviceOpen, setDeviceOpen] = useState(false)
  const [devices, setDevices] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [tracksToDownload, setTracksToDownload] = useState([])
  const mobile = !useMediaQuery('(min-width:600px)')

  const getDevices = () => {
    get('/player/devices').then(({ data: { devices } }) => {
      devices = devices || []
      setDevices(devices)
      setDevice(devices[0])
    })
  }

  useEffect(getDevices, [])

  function closeMenu() {
    setAnchorEl(null)
  }

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

  const defaultMenuItemProps = {
    setter: { setTrackFilters },
    state: { trackFilters },
    onClose: { closeMenu },
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
                {...defaultMenuItemProps}
                filterKey="minimalTitle"
                name="Minimize title"
              />
              <CheckMenuItem
                {...defaultMenuItemProps}
                filterKey="isNotDownloaded"
                name="Not downloaded"
              />
              <CheckMenuItem
                {...defaultMenuItemProps}
                filterKey="hideArtist"
                name="Hide artist"
              />
            </Menu>
          </Grid>
        </>
      )}

      <Grid item>
        {track && trackId && (
          <Autocomplete
            fullWidth
            value={track}
            onChange={(_, t) => selectTrackId(t)}
            autoHighlight
            options={tracks}
            getOptionLabel={(t) => t.toString(trackFilters)}
            getOptionSelected={(option, value) => option.id === trackId}
            style={{ width: mobile ? 200 : 300 }}
            size="small"
            renderInput={(params) => (
              <TextField {...params} label="Select track:" variant="outlined" />
            )}
          />
        )}
      </Grid>
      {device && (
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
      <Player
        track={track}
        playPosition={playPosition}
        playlist={playlist}
        radio={radio}
        tracks={tracks}
        device={device}
      />
    </Grid>
  )
}
