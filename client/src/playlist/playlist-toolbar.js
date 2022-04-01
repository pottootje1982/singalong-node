import React, { useEffect, useState, useContext } from "react"
import ServerContext from "../server-context"
import {
  IconButton,
  Grid,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core"
import {
  GetApp as DownloadIcon,
  NavigateBefore,
  NavigateNext,
} from "@material-ui/icons"
import ToggleButton from "@material-ui/lab/ToggleButton"
import Autocomplete from "@material-ui/lab/Autocomplete"

import PlayerContext from "../player/player-context"
import PlaylistContext from "./playlist-context"
import usePlayTrack from "../player/player-hooks"
import FilterContextMenu from "./filter-context-menu"
import DownloadContext from "../lyrics/download-context"

export default function PlaylistToolbar({
  trackFilters,
  setTrackFilters,
  selectTrackId,
  lyricsFullscreen,
}) {
  const { spotifyAxios } = useContext(ServerContext)
  const { track, trackId, setTrackId, tracks } = useContext(
    PlaylistContext
  )
  const { downloadTracks, stopDownloading, isDownloading } = useContext(DownloadContext)

  const {
    device,
    setDevice,
    setMonitorCurrentlyPlaying,
    isPlaying,
    player,
  } = useContext(PlayerContext)

  const [deviceOpen, setDeviceOpen] = useState(false)
  const [devices, setDevices] = useState()
  const mobile = !useMediaQuery("(min-width:600px)")
  const trackFound = tracks.find((t) => t.id === trackId)
  const playTrack = usePlayTrack()

  const getDevices = () => {
    if (player) {
      spotifyAxios().get("/me/player/devices").then(({ data: { devices } }) => {
        devices = devices || []
        const deviceToSelect =
          devices.find((d) => d.is_active) ||
          devices.find((d) => d.id === device) ||
          devices[0]
        if (deviceToSelect) setDevice(deviceToSelect.id)
        setDevices(devices)
      })
    }
  }

  useEffect(getDevices, [player])

  function selectDevice() {
    if (devices) {
      spotifyAxios().put("/me/player", { device_ids: [device] })
    }
  }

  useEffect(selectDevice, [device])

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

  return (
    <Grid container item spacing={1} alignItems="center">
      {!lyricsFullscreen && (
        <>
          <Grid item>
            <ToggleButton
              value="check"
              selected={isDownloading}
              onClick={() => !isDownloading ? downloadTracks(tracks) : stopDownloading()}
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
          alignItems="center"
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
              options={tracks}
              noOptionsText=""
              getOptionLabel={(t) => t.toString(trackFilters)}
              getOptionSelected={(option, value) =>
                trackFound
                  ? option.id === value.id
                  : tracks.indexOf(option) === 0
              }
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

      {!(mobile && lyricsFullscreen) && devices && device && (
        <Grid item>
          <FormControl variant="outlined" size="small">
            <InputLabel id="device-select">Device:</InputLabel>
            <Select
              labelId="device-select"
              open={deviceOpen}
              label="Device:"
              onClose={() => setDeviceOpen(false)}
              onOpen={() => setDeviceOpen(true)}
              value={(devices || []).find((d) => d.id === device)}
              onChange={(e) => setDevice(e.target.value.id)}
              fullWidth
              style={{ width: 150 }}
            >
              {(devices || []).map((d, i) => (
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
