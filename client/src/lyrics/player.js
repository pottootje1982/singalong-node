import React, { useContext, useEffect, useState } from 'react'
import { IconButton } from '@material-ui/core'
import { Grid, Slider, Typography } from '@material-ui/core'
import { SkipPrevious, SkipNext, PlayArrow, Pause } from '@material-ui/icons'
import { spotifyAxios } from '../server'
import usePlayTrack, { useUpdatePlayingTrack } from './player-hooks'
import PlayerContext from './player-context'
import PlaylistContext from '../playlist/playlist-context'
import WebPlayer from './web-player'

export default function Player() {
  const { track, setTrackId, setPlaylist } = useContext(PlaylistContext)
  const {
    device,
    player,
    isPlaying,
    setIsPlaying,
    currentlyPlaying,
    monitorCurrentlyPlaying,
    playPosition,
    setPlayPosition,
    duration,
    setDuration,
  } = useContext(PlayerContext)

  const [updateInterval, setUpdateInterval] = useState()
  const [currentlyPlayingDevice, setCurrentlyPlayingDevice] = useState()
  const [timestamp, setTimestamp] = useState()
  const [seeking, setSeeking] = useState(false)
  const playTrack = usePlayTrack()
  const updateCurrentlyPlaying = useUpdatePlayingTrack()
  const [playerState, setPlayerState] = useState()

  function init() {
    spotifyAxios.get('/me/player').then(({ data }) => {
      const { device } = data || {}
      if (device) {
        setCurrentlyPlayingDevice(device)
      }
    })
  }
  useEffect(init, [])

  function updatePlayingPosition() {
    if (!seeking) {
      setPlayPosition((playPosition) => playPosition + 1)
      if (playPosition >= duration) {
        update()
      }
    }
  }

  useEffect(updatePlayingPosition, [timestamp])

  function updateTimestamp() {
    setTimestamp(new Date().getTime())
  }

  function isPlayingChanged() {
    if (isPlaying) setUpdateInterval(setInterval(updateTimestamp, 1000))
    else clearInterval(updateInterval)
  }

  useEffect(isPlayingChanged, [isPlaying])

  function showCurrentlyPlayingTrack() {
    if (currentlyPlaying) {
      setTrackId(currentlyPlaying.item.id)
      setPlaylist(currentlyPlaying.context.uri)
    }
  }

  useEffect(showCurrentlyPlayingTrack, [currentlyPlaying])

  function updatePlayerState() {
    if (playerState) {
      const {
        position,
        duration,
        context,
        track_window: { current_track },
      } = playerState
      setPlayPosition(position / 1000)
      setDuration(duration / 1000)
      if (monitorCurrentlyPlaying) {
        setPlaylist(context.uri)
        setTrackId(current_track.linked_from.id || current_track.id)
      }
    }
  }

  useEffect(updatePlayerState, [playerState])

  function deviceUpdated() {
    if (currentlyPlayingDevice) {
      update()
    }
    // To prevent playback being set again on startup
    if (
      currentlyPlayingDevice &&
      device &&
      device.id !== currentlyPlayingDevice.id
    ) {
      spotifyAxios.put(`/me/player`, { device_ids: [device.id] })
      setCurrentlyPlayingDevice(device)
    }
  }

  function monitorUpdated() {
    if (monitorUpdated) updateCurrentlyPlaying()
  }

  useEffect(monitorUpdated, [monitorCurrentlyPlaying])

  useEffect(deviceUpdated, [device, currentlyPlayingDevice])

  useEffect(updateCurrentlyPlaying, [track])

  function onPlayPositionClick(_, value) {
    setPlayPosition(value)
    setSeeking(true)
    spotifyAxios.put(`me/player/seek?position_ms=${value * 1000}`).then(() => {
      setSeeking(false)
      update()
    })
  }

  async function togglePlay() {
    setSeeking(true)
    if (isPlaying === undefined) {
      await playTrack(track.uri, 0)
    } else {
      await spotifyAxios.put(`/me/player/${isPlaying ? 'pause' : 'play'}`)
    }
    setSeeking(false)
    setIsPlaying(!isPlaying)
  }

  async function spotifyCommand(command) {
    setSeeking(true)
    await spotifyAxios.post(`/me/player/${command}`)
    setSeeking(false)
    update()
  }

  function pad(num, size) {
    var s = Math.floor(num) + ''
    while (s.length < size) s = '0' + s
    return s
  }

  function isWebPlayback() {
    return (device && device.id) === (player && player._options.id)
  }

  function update() {
    if (!isWebPlayback()) {
      updateCurrentlyPlaying()
    }
  }

  function valuetext(value) {
    value = value || 0
    const minutes = value / 60
    return `${pad(minutes, 2)}:${pad(value % 60, 2)}`
  }

  return (
    <>
      <WebPlayer setPlayerState={setPlayerState} />
      <Grid item>
        <IconButton size="small" onClick={() => spotifyCommand(`previous`)}>
          <SkipPrevious />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton size="small" onClick={togglePlay}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Grid>

      <Grid item>
        <IconButton size="small" onClick={() => spotifyCommand('next')}>
          <SkipNext />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="caption">
          {valuetext(Math.min(playPosition, duration))}
        </Typography>
      </Grid>
      <Grid item xs>
        <Slider
          min={0}
          value={playPosition}
          max={duration}
          step={1}
          getAriaValueText={valuetext}
          onChange={onPlayPositionClick}
        />
      </Grid>
      <Grid item>
        <Typography variant="caption">{valuetext(duration)}</Typography>
      </Grid>
    </>
  )
}
