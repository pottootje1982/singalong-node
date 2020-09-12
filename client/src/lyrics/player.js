import React from 'react'
import { IconButton } from '@material-ui/core'
import { Grid, Slider } from '@material-ui/core'
import { SkipPrevious, SkipNext } from '@material-ui/icons'
import { post } from '../server'

export default function Player({ track }) {
  function skipTrack(command, playPosition) {
    post('player', { command, position: playPosition || 0 })
  }

  return (
    <>
      <Grid item style={{ marginLeft: 20 }}>
        <IconButton size="small" onClick={() => skipTrack('previous')}>
          <SkipPrevious />
        </IconButton>
      </Grid>
      <Grid item>
        <Slider
          min={0}
          max={track.duration_ms / 1000}
          step={1}
          style={{ width: 150 }}
          onChange={(_, value) => skipTrack('position', value * 1000)}
        />
      </Grid>
      <Grid item>
        <IconButton size="small" onClick={() => skipTrack('next')}>
          <SkipNext />
        </IconButton>
      </Grid>
    </>
  )
}
