import React, { useEffect, useState, useContext } from 'react'
import { get, post } from '../server'
import { Grid } from '@material-ui/core'
import { Track } from '../track'
import PlaylistToolbar from './playlist-toolbar'
import Tracks from './tracks'
import PlaylistContext from '../playlist/playlist-context'

export default function Playlist({
  trackFilters,
  setTrackFilters,
  lyricsFullscreen,
}) {
  const [trackIdToDownload, setTrackIdToDownload] = useState()
  const [tracks, setTracks] = useState([])
  const { setTrackId, radio } = useContext(PlaylistContext)

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
          setTrackFilters={setTrackFilters}
          tracks={tracks}
          selectTrackId={selectTrackId}
          trackIdToDownload={trackIdToDownload}
          setTrackIdToDownload={setTrackIdToDownload}
          lyricsFullscreen={lyricsFullscreen}
        />
      </Grid>
      <Grid item>
        <Tracks
          trackFilters={trackFilters}
          lyricsFullscreen={lyricsFullscreen}
          selectTrackId={selectTrackId}
          tracks={tracks}
          setTracks={setTracks}
          trackIdToDownload={trackIdToDownload}
        />
      </Grid>
    </>
  )
}
