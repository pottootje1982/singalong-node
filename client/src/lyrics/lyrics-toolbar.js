import React, { useEffect, useContext } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { post } from '../server'
import { Grid } from '@material-ui/core'
import { Fullscreen, FullscreenExit, QueueMusic } from '@material-ui/icons'

import { Track } from '../track'
import LyricsMenu from './lyrics-menu'
import PlaylistContext from '../playlist/playlist-context'
import Player from './player'
import { useUpdatePlayingTrack } from './player-hooks'

export default function LyricsToolbar({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
}) {
  const { track, setTrack } = useContext(PlaylistContext)
  const updateCurrentlyPlaying = useUpdatePlayingTrack()

  function showCurrentlyPlayingTrack() {
    updateCurrentlyPlaying()
  }

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
        <Tooltip
          title="Show currently playing track on Spotify"
          aria-label="add"
        >
          <IconButton size="small" onClick={() => showCurrentlyPlayingTrack()}>
            <QueueMusic />
          </IconButton>
        </Tooltip>
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
