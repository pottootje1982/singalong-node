import React, { useState, useEffect, useRef } from 'react'
import { TextField } from '@material-ui/core'
import { Grid } from '@material-ui/core'
import { Track } from '../track'
import LyricsToolbar from './lyrics-toolbar'

export default function Lyrics({
  track,
  setPlaylist,
  setTrack,
  setTrackId,
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setPlayPosition,
}) {
  const lyricsRef = useRef(null)
  const [lyrics, setLyrics] = useState()

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track])

  track = track || new Track({})
  return (
    <Grid container spacing={1} direction="column" alignItems="stretch">
      <Grid container item alignItems="center" spacing={1}>
        <LyricsToolbar
          setPlaylist={setPlaylist}
          track={track}
          setTrack={setTrack}
          setTrackId={setTrackId}
          lyricsFullscreen={lyricsFullscreen}
          setLyricsFullscreen={setLyricsFullscreen}
          setLyrics={setLyrics}
          trackFilters={trackFilters}
          setPlayPosition={setPlayPosition}
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
          label={`Lyrics ${track.toString(trackFilters)}`}
          multiline
          rows={!lyricsFullscreen ? 18 : undefined}
          defaultValue={lyrics}
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}
