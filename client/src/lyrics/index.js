import React, { useState, useEffect, useRef } from 'react'
import { TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import { get, post, del } from '../server'
import { Grid } from '@material-ui/core'
import { Button } from '../Styled'

export default function Lyrics({ track, setTrackId, refreshTracks }) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const [sites, setSites] = useState({})
  const [lyrics, setLyrics] = useState()
  const lyricsRef = useRef(null)

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
      setSites(sites || {})
    })
  }

  function downloadLyrics(track, site) {
    post('/v2/lyrics/download', { track, site }).then(
      ({ data: { lyrics } }) => {
        setLyrics(lyrics)
      }
    )
  }

  function saveLyrics(track) {
    const lyrics = lyricsRef.current.value
    post('/v2/lyrics', { track, lyrics })
    track.lyrics = lyrics
    refreshTracks()
  }

  function removeLyrics(track) {
    track.lyrics = null
    del('/v2/lyrics', { data: { track } })
    refreshTracks()
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
            inputRef={lyricsRef}
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
          <Grid container>
            {Object.entries(sites).map(([key, engine]) => (
              <Grid key={key} item>
                <Button onClick={() => downloadLyrics(track, key)}>
                  {engine.name}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Grid container style={{ marginTop: 50 }}>
            <Button onClick={() => saveLyrics(track)}>Save</Button>
            <Button onClick={() => removeLyrics(track)}>Remove</Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}
