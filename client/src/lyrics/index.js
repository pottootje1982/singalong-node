import React, { useState, useEffect, useRef, useContext } from 'react'
import { TextField } from '@material-ui/core'
import { Grid } from '@material-ui/core'
import { Track } from '../track'
import LyricsToolbar from './lyrics-toolbar'
import PlaylistContext from '../playlist/playlist-context'

export default function Lyrics({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
}) {
  const { track } = useContext(PlaylistContext)
  const lyricsRef = useRef(null)
  const [lyrics, setLyrics] = useState()

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track])

  const trackToDisplay = track || new Track({})
  return (
    <Grid container spacing={1} direction="column" alignItems="stretch">
      <Grid container item alignItems="center" spacing={1}>
        <LyricsToolbar
          lyricsFullscreen={lyricsFullscreen}
          setLyricsFullscreen={setLyricsFullscreen}
          setLyrics={setLyrics}
          trackFilters={trackFilters}
          lyricsRef={lyricsRef}
        />
      </Grid>
      <Grid item>
        <TextField
          key={lyrics}
          fullWidth
          inputRef={lyricsRef}
          id="outlined-multiline-static"
          filters={trackFilters}
          label={`Lyrics ${trackToDisplay.toString(trackFilters)}`}
          multiline
          rows={!lyricsFullscreen ? 18 : undefined}
          defaultValue={lyrics}
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}
