import React, { useEffect, useState } from 'react'
import { get, post } from '../server'
import { Grid } from '@material-ui/core'
import { Track } from '../track'
import PlaylistToolbar from './playlist-toolbar'
import Tracks from './tracks'

export default function Playlist({
  playlist,
  radio,
  setTrack,
  track,
  trackId,
  setTrackId,
  trackFilters,
  setTrackFilters,
  lyricsFullscreen,
  playPosition,
}) {
  const [trackIdToDownload, setTrackIdToDownload] = useState()
  const [device, setDevice] = useState()
  const [tracks, setTracks] = useState([])

  useEffect(showCurrentlyOnFip, [radio])

  function showCurrentlyOnFip() {
    if (radio) {
      setTracks([])
      get('/radio/fip').then(({ data: { tracks, position } }) => {
        if (!tracks) return alert('Cannot retrieve playing status radio')
        setTracks(tracks.map(Track.copy))
        setTrackId(tracks[position].id)
        post('/spotify/search', { tracks }).then(
          ({ data: { tracks: foundTracks } }) => {
            setTracks((foundTracks || []).map(Track.copy))
          }
        )
      })
    }
  }

  function selectTrackId(track) {
    if (track) setTrackId(track.id)
  }

  return (
    <>
      <Grid item>
        <PlaylistToolbar
          device={device}
          setDevice={setDevice}
          setTrackFilters={setTrackFilters}
          track={track}
          setTrack={setTrack}
          trackId={trackId}
          tracks={tracks}
          selectTrackId={selectTrackId}
          trackIdToDownload={trackIdToDownload}
          setTrackIdToDownload={setTrackIdToDownload}
          lyricsFullscreen={lyricsFullscreen}
          playPosition={playPosition}
          playlist={playlist}
          radio={radio}
        />
      </Grid>
      <Grid item>
        <Tracks
          trackFilters={trackFilters}
          lyricsFullscreen={lyricsFullscreen}
          trackId={trackId}
          setTrackId={setTrackId}
          selectTrackId={selectTrackId}
          track={track}
          setTrack={setTrack}
          playlist={playlist}
          tracks={tracks}
          setTracks={setTracks}
          trackIdToDownload={trackIdToDownload}
          radio={radio}
          device={device}
        />
      </Grid>
    </>
  )
}
