import React, { useState } from 'react'
import { IconButton } from '@material-ui/core'
import { Grid, Slider, Typography } from '@material-ui/core'
import { SkipPrevious, SkipNext, PlayArrow, Pause } from '@material-ui/icons'
import { post } from '../server'
import usePlayTrack from './play-track'

export default function Player({
  track,
  playPosition,
  playlist,
  radio,
  tracks,
  device,
}) {
  const [playing, setPlaying] = useState(false)
  const duration = track ? track.duration_ms / 1000 : 0

  const playTrack = usePlayTrack({ playlist, radio, tracks, device })

  function playerCommand(command, playPosition) {
    post('player', { command, position: playPosition || 0 })
  }

  function setPlayPosition(_, value) {
    playerCommand('position', value * 1000)
  }

  function togglePlay() {
    setPlaying(!playing)
    if (playing) {
      playTrack(track.uri)
    } else {
      playerCommand('pause')
    }
  }

  function pad(num, size) {
    var s = Math.floor(num) + ''
    while (s.length < size) s = '0' + s
    return s
  }

  function valuetext(value) {
    const minutes = value / 60
    return `${pad(minutes, 2)}:${pad(value % 60, 2)}`
  }

  return (
    <Grid container alignItems="center">
      <Grid item>
        <IconButton size="small" onClick={() => playerCommand('previous')}>
          <SkipPrevious />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton size="small" onClick={togglePlay}>
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Grid>

      <Grid item>
        <IconButton size="small" onClick={() => playerCommand('next')}>
          <SkipNext />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography>{valuetext(playPosition)}</Typography>
      </Grid>
      <Grid item>
        <Slider
          min={0}
          value={playPosition}
          max={duration}
          step={1}
          style={{ width: 150, marginLeft: 10, marginRight: 10 }}
          getAriaValueText={valuetext}
          onChange={setPlayPosition}
        />
      </Grid>
      <Grid item>
        <Typography>{valuetext(duration)}</Typography>
      </Grid>
    </Grid>
  )
}
