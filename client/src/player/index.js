import React, { useContext, useEffect, useState } from 'react'
import { IconButton } from '@material-ui/core'
import { Grid, Slider, Typography } from '@material-ui/core'
import { SkipPrevious, SkipNext, PlayArrow, Pause } from '@material-ui/icons'

import { spotifyAxios } from '../server'
import usePlayTrack, { useUpdatePlayingTrack } from './player-hooks'
import PlayerContext from './player-context'
import PlaylistContext from '../playlist/playlist-context'
import WebPlayer from './web-player'
import { useHistory } from 'react-router-dom'

export default function Player() {
  const { track, setTrackId, tracks } = useContext(PlaylistContext)
  const {
    device,
    player,
    isPlaying,
    setIsPlaying,
    currentlyPlaying,
    monitorCurrentlyPlaying,
    setMonitorCurrentlyPlaying,
    playPosition,
    setPlayPosition,
    duration,
    setDuration,
    lastUpdateTime,
    lastPlayPosition,
  } = useContext(PlayerContext)

  const [updateInterval, setUpdateInterval] = useState()
  const [timestamp, setTimestamp] = useState()
  const [seeking, setSeeking] = useState(false)
  const playTrack = usePlayTrack()
  const updateCurrentlyPlaying = useUpdatePlayingTrack(navigateToPlaylist)
  const [playerState, setPlayerState] = useState()
  const history = useHistory()

  function updatePlayingPosition() {
    if (!seeking) {
      const newPosition =
        lastUpdateTime && lastPlayPosition
          ? lastPlayPosition + (timestamp - lastUpdateTime) / 1000
          : 0
      setPlayPosition(newPosition)
      if (newPosition >= duration) {
        update()
      }
    }
  }

  useEffect(updatePlayingPosition, [timestamp])

  function updateTimestamp() {
    setTimestamp(Date.now())
  }

  function isPlayingChanged() {
    if (isPlaying) setUpdateInterval(setInterval(updateTimestamp, 1000))
    else clearInterval(updateInterval)
  }

  useEffect(isPlayingChanged, [isPlaying])

  function showCurrentlyPlayingTrack() {
    if (currentlyPlaying) {
      setTrackId(currentlyPlaying.item.id)
      navigateToPlaylist(currentlyPlaying.context.uri)
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
      const { linked_from_uri, uri, linked_from, id } = current_track || {}
      const uriPlaying = linked_from_uri || uri
      const trackPlaying = tracks.find((t) => t.uri === uriPlaying)
      const idToSelect = linked_from.id || id
      if (monitorCurrentlyPlaying && !trackPlaying) {
        navigateToPlaylist(context.uri)
        setTrackId(idToSelect)
      }
    }
  }

  useEffect(updatePlayerState, [playerState])

  function deviceUpdated() {
    if (device) update()
  }

  function monitorUpdated() {
    if (monitorUpdated) updateCurrentlyPlaying()
  }

  useEffect(monitorUpdated, [monitorCurrentlyPlaying])
  useEffect(deviceUpdated, [device])

  async function onPlayPositionClick(_, value) {
    setPlayPosition(value)
    setSeeking(true)
    await spotifyAxios.put(`me/player/seek?position_ms=${value * 1000}`)
    await update()
    setSeeking(false)
    setPlayPosition(value)
  }

  async function togglePlay() {
    setSeeking(true)
    if (isPlaying === undefined) {
      await playTrack(track.uri, 0)
    } else {
      await spotifyAxios.put(`/me/player/${isPlaying ? 'pause' : 'play'}`)
    }
    await update()
    setSeeking(false)
    setIsPlaying(!isPlaying)
    setMonitorCurrentlyPlaying(true)
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function spotifyCommand(command) {
    setSeeking(true)
    await spotifyAxios.post(`/me/player/${command}`)
    setSeeking(false)
    await update()
    await sleep(1000)
    // repeat to make sure new track is displayed
    update()
  }

  function pad(num, size) {
    var s = Math.floor(num) + ''
    while (s.length < size) s = '0' + s
    return s
  }

  function isWebPlayback() {
    const { _options } = player || {}
    return device === (_options && _options.id)
  }

  function update() {
    if (!isWebPlayback()) return updateCurrentlyPlaying()
  }

  function valuetext(value) {
    value = value || 0
    const minutes = value / 60
    return `${pad(minutes, 2)}:${pad(value % 60, 2)}`
  }

  function navigateToPlaylist(uri) {
    history.push(`/playlist/${uri}`)
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
