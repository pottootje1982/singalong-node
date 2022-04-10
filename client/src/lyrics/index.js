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
  const [lyricsLines, setLyricsLines] = useState(window.localStorage.getItem('lyricsLines'))

  useEffect(() => {
    if (track) {
      setLyrics(track.lyrics)
    }
  }, [track])

  useEffect(() => {
    setLyricsLines(window.localStorage.getItem('lyricsLines'))
  }, [lyrics, setLyricsLines])

  const onMouseUp = () => {
    if (mouseDown) {
      const height = stackRef.current.clientHeight
      setLyricsHeight(height)
      window.localStorage.setItem('lyricsLines', height / 20)
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
        maxRows={!lyricsFullscreen ? lyricsLines : undefined}
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
