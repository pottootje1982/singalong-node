import React, { useEffect, useContext } from 'react'
import { IconButton } from '@material-ui/core'
import { post } from '../server'
import { Grid } from '@material-ui/core'
import { Fullscreen, FullscreenExit } from '@material-ui/icons'

import { Track } from '../track'
import LyricsMenu from './lyrics-menu'
import PlaylistContext from '../playlist/playlist-context'
import Player from './player'

export default function LyricsToolbar({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
}) {
  const { track, setTrack } = useContext(PlaylistContext)

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track, setLyrics])

  function downloadLyrics(track, save) {
    post('lyrics/download', { track, getCached: false, save }).then(
      ({ data: { lyrics } }) => {
        if (lyrics) {
          track.lyrics = lyrics
          setTrack(Track.copy({ ...track, lyrics }))
        }
      }
    )
  }

  return (
    <>
      <Grid item>
        <IconButton
          size="small"
          onClick={() => {
            setLyricsFullscreen(!lyricsFullscreen)
          }}
        >
          {lyricsFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Grid>
      <Grid item>
        <LyricsMenu
          lyricsRef={lyricsRef}
          trackFilters={trackFilters}
          downloadLyrics={downloadLyrics}
        />
      </Grid>
      <Player />
    </>
  )
}
