import React, { useState, useEffect, useRef } from 'react'
import { TextField, Checkbox } from '@material-ui/core'
import { get, post, del } from '../server'
import { Grid } from '@material-ui/core'
import { Button } from '../Styled'

export default function Lyrics({ track, setPlaylist, setTrack, setTrackId }) {
  const [showCurrentlyPlaying, setShowCurrentlyPlaying] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const [sites, setSites] = useState({})
  const lyricsRef = useRef(null)
  const [lyrics, setLyrics] = useState()

  function setOrClearProbe() {
    if (showCurrentlyPlaying) {
      const probe = setInterval(showCurrentlyPlaying, 2000)
      setCurrentlyPlayingProbe(probe)
    } else {
      clearInterval(currentlyPlayingProbe)
    }
  }

  useEffect(setOrClearProbe, [showCurrentlyPlaying])

  useEffect(getSites, [])

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track])

  function showCurrentlyPlayingTrack() {
    get('/player').then(({ data: { track, uri } }) => {
      if (track) {
        setPlaylist(uri)
        setTrackId(track.id)
      }
    })
  }

  function getSites() {
    get('/lyrics/sites').then(({ data: { sites } }) => {
      setSites(sites || {})
    })
  }

  function downloadLyrics(track, site) {
    post('/lyrics/download', { track, site }).then(({ data: { lyrics } }) => {
      setLyrics(lyrics)
    })
  }

  function saveLyrics(track) {
    const lyrics = lyricsRef.current.value
    post('/lyrics', { track, lyrics })
    track.lyrics = lyrics
    setTrack({ ...track })
  }

  function removeLyrics(track) {
    track.lyrics = null
    del('/lyrics', { data: { track } })
    setTrack({ ...track })
  }

  track = track || {}
  const label = track.artist ? ` ${track.artist} - ${track.title}` : ''
  return (
    <Grid container spacing={1}>
      <Grid container item alignItems="center">
        <Grid item>
          <Checkbox
            color="primary"
            onChange={(_e, checked) => setShowCurrentlyPlaying(checked)}
          />
        </Grid>
        <Grid item>
          <Button
            style={{ width: 200 }}
            onClick={() => {
              showCurrentlyPlayingTrack()
            }}
          >
            Show currently playing
          </Button>
        </Grid>
        <Grid item>
          <Button
            style={{ width: 200 }}
            onClick={() => {
              setPlaylist('FIP')
            }}
          >
            Currently on FIP
          </Button>
        </Grid>
      </Grid>
      <Grid container item>
        <Grid item xs={10}>
          <TextField
            key={lyrics}
            inputRef={lyricsRef}
            id="outlined-multiline-static"
            label={`Lyrics${label}`}
            multiline
            rows={18}
            defaultValue={lyrics}
            style={{ width: '50vw' }}
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
    </Grid>
  )
}
