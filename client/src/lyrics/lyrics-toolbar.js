import React, { useEffect, useContext } from 'react'
import { IconButton } from '@material-ui/core'
import { Grid } from '@material-ui/core'
import { Fullscreen, FullscreenExit } from '@material-ui/icons'

import LyricsMenu from './lyrics-menu'
import PlaylistContext from '../playlist/playlist-context'
import Player from '../player'

export default function LyricsToolbar({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
}) {
  const { track } = useContext(PlaylistContext)

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track, setLyrics])


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
        />
      </Grid>
      <Player />
    </>
  )
}
