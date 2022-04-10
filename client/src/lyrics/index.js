import React, { useState, useEffect, useRef, useContext } from 'react'
import { TextField } from '@mui/material'
import { Stack } from '@mui/material'
import { Track } from '../track'
import LyricsToolbar from './lyrics-toolbar'
import PlaylistContext from '../playlist/playlist-context'
import PlaylistToolbar from '../playlist/playlist-toolbar'

export default function Lyrics({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setTrackFilters
}) {
  const { track, setLyricsHeight, setTrackId } = useContext(PlaylistContext)
  const [mouseDown, setMouseDown] = useState()
  const lyricsRef = useRef()
  const stackRef = useRef()
  const [lyrics, setLyrics] = useState()

  useEffect(() => (track) && setLyrics(track.lyrics), [track])

  const onMouseUp = () => {
    if (mouseDown) {
      const height = stackRef.current.clientHeight
      setLyricsHeight(height)
    }
  }

  function selectTrackId(track) {
    if (track) setTrackId(track.id)
  }

  const trackToDisplay = track || new Track({})
  return (
    <Stack spacing={1} alignItems="stretch" ref={stackRef} >
      <LyricsToolbar
        lyricsFullscreen={lyricsFullscreen}
        setLyricsFullscreen={setLyricsFullscreen}
        setLyrics={setLyrics}
        trackFilters={trackFilters}
        lyricsRef={lyricsRef}
      />
      <TextField
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
        onMouseMove={onMouseUp}
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
      <PlaylistToolbar
        trackFilters={trackFilters}
        setTrackFilters={setTrackFilters}
        selectTrackId={selectTrackId}
        lyricsFullscreen={lyricsFullscreen}
      />
    </Stack>
  )
}
