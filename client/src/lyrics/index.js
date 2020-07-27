import React from 'react'
import TextField from '@material-ui/core/TextField'

export default function Lyrics({ track }) {
  track = track || {}
  return (
    <TextField
      key={track.id}
      id="outlined-multiline-static"
      label="Lyrics"
      multiline
      rows={18}
      defaultValue={track.lyrics}
      style={{ width: '60vw', margin: 5 }}
      variant="outlined"
    />
  )
}
