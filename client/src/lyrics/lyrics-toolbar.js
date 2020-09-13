import React, { useEffect } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { get, post } from '../server'
import { Grid } from '@material-ui/core'
import { Fullscreen, FullscreenExit, QueueMusic } from '@material-ui/icons'
import { Track } from '../track'
import LyricsMenu from './lyrics-menu'

export default function LyricsToolbar({
  track,
  setPlaylist,
  setTrack,
  setTrackId,
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
  setPlayPosition,
}) {
  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track, setLyrics])

  function showCurrentlyPlayingTrack() {
    get('/player').then(({ data: { track, uri } }) => {
      if (track) {
        setPlaylist(uri)
        setTrackId(track.id)
        setPlayPosition(track.progress_ms / 1000)
      }
    })
  }

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
          track={track}
          setTrack={setTrack}
          trackFilters={trackFilters}
          showCurrentlyPlayingTrack={showCurrentlyPlayingTrack}
          downloadLyrics={downloadLyrics}
        />
      </Grid>
    </>
  )
}
