import React, { useEffect, useContext } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { get, post } from '../server'
import { Grid } from '@material-ui/core'
import { Fullscreen, FullscreenExit, QueueMusic } from '@material-ui/icons'
import { Track } from '../track'
import LyricsMenu from './lyrics-menu'
import PlayerContext from '../playlist/player-context'
import PlaylistContext from '../playlist/playlist-context'

export default function LyricsToolbar({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
}) {
  const { setPlayPosition, setIsPlaying } = useContext(PlayerContext)
  const { track, setTrack, setTrackId, setPlaylist } = useContext(
    PlaylistContext
  )

  useEffect(() => {
    if (track) setLyrics(track.lyrics)
  }, [track, setLyrics])

  function showCurrentlyPlayingTrack() {
    return get('/player').then(({ data: { track, uri } }) => {
      if (track) {
        setTrackId(track.id)
        setPlaylist(uri)
        setPlayPosition(track.progress_ms / 1000)
        setIsPlaying(track.is_playing)
        return track
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
          trackFilters={trackFilters}
          showCurrentlyPlayingTrack={showCurrentlyPlayingTrack}
          downloadLyrics={downloadLyrics}
        />
      </Grid>
    </>
  )
}
