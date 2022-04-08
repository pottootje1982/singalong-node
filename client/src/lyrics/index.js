import React, { useState, useEffect, useRef, useContext } from 'react'
import { Container, TextField } from '@mui/material'
import { Stack } from '@mui/material'
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
    <Stack spacing={1} alignItems="stretch" >
      <LyricsToolbar
        lyricsFullscreen={lyricsFullscreen}
        setLyricsFullscreen={setLyricsFullscreen}
        setLyrics={setLyrics}
        trackFilters={trackFilters}
        lyricsRef={lyricsRef}
      />
      <TextField
        key={lyrics}
        fullWidth
        inputRef={lyricsRef}
        id="outlined-multiline-static"
        label={`Lyrics ${trackToDisplay.toString(trackFilters)}`}
        multiline
        maxRows={!lyricsFullscreen ? 20 : undefined}
        defaultValue={lyrics}
        variant="outlined"
        InputProps={{ style: { fontSize: 14 } }}
      />
    </Stack>
  )
}
