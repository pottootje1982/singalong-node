import React, { useState, useEffect } from 'react'
import { TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import { get, post } from '../server'
import { Grid, Button } from '@material-ui/core'

export default function Lyrics({ track, setTrackId }) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const [sites, setSites] = useState({})
  const [lyrics, setLyrics] = useState()

  function setOrClearProbe() {
    if (showCurrentlyPlaying) {
      const probe = setInterval(checkCurrentlyPlaying, 2000)
      setCurrentlyPlayingProbe(probe)
    } else {
      clearInterval(currentlyPlayingProbe)
    }
  }

  useEffect(setOrClearProbe, [showCurrentlyPlaying])
  useEffect(() => {
    setLyrics(track.lyrics)
  }, [track])

  useEffect(getSites, [])

  function checkCurrentlyPlaying() {
    get('/v2/player').then(({ data: { id } }) => {
      setTrackId(id)
    })
  }

  function getSites() {
    get('/v2/lyrics/sites').then(({ data: { sites } }) => {
      setSites(sites)
    })
  }

  function downloadLyrics(track, site) {
    post('/v2/lyrics/download', { track, site }).then(
      ({ data: { lyrics } }) => {
        console.log(lyrics)
        setLyrics(lyrics)
      }
    )
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

      <Grid container>
        <Grid item xs={10}>
          <TextField
            key={lyrics}
            id="outlined-multiline-static"
            label={`Lyrics${label}`}
            multiline
            rows={18}
            defaultValue={lyrics}
            style={{ width: '50vw', margin: 5 }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={2}>
          {Object.entries(sites).map(([key, engine]) => (
            <Button key={key} onClick={() => downloadLyrics(track, key)}>
              {engine.name}
            </Button>
          ))}
        </Grid>
      </Grid>
    </div>
  )
}
