import React, { useState, useEffect } from 'react'
import { TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import { get } from '../server'

export default function Lyrics({ track, setTrackId }) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()

  function setOrClearProbe() {
    if (showCurrentlyPlaying) {
      const probe = setInterval(checkCurrentlyPlaying, 2000)
      setCurrentlyPlayingProbe(probe)
    } else {
      clearInterval(currentlyPlayingProbe)
    }
  }

  useEffect(setOrClearProbe, [showCurrentlyPlaying])

  function checkCurrentlyPlaying() {
    get('/v2/player').then(({ data: { id } }) => {
      setTrackId(id)
    })
  }

  track = track || {}
  const label = track.artist ? ` ${track.artist} - ${track.title}` : ''
  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            color="primary"
            onChange={(_e, checked) => setShowCurrentlyPlaying(checked)}
          ></Checkbox>
        }
        label="Show currently playing"
      />

      <TextField
        key={track.id}
        id="outlined-multiline-static"
        label={`Lyrics${label}`}
        multiline
        rows={18}
        defaultValue={track.lyrics}
        style={{ width: '60vw', margin: 5 }}
        variant="outlined"
      />
    </div>
  )
}
