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
  const { setTrackId, radio, customPlaylist, setTracks, playlist } = useContext(
    PlaylistContext
  )

  useEffect(showCustomPlaylist, [customPlaylist])

  function showCustomPlaylist() {
    if (customPlaylist) {
      setTracks([])
      get(`/playlists/${customPlaylist}/custom`).then(
        ({ data: { tracks } }) => {
          if (!tracks) return
          setTracks(tracks.map(Track.copy))
          setTrackId(tracks[0].id)
          post('/spotify/search', { tracks }).then(
            ({ data: { tracks: foundTracks } }) => {
              setTracks((foundTracks || []).map(Track.copy))
            }
          )
        }
      )
    }
  }

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
          trackFilters={trackFilters}
          setTrackFilters={setTrackFilters}
          selectTrackId={selectTrackId}
          trackIdToDownload={trackIdToDownload}
          setTrackIdToDownload={setTrackIdToDownload}
          lyricsFullscreen={lyricsFullscreen}
        />
      </Grid>
      <Grid item>
        <Tracks
          key={playlist}
          trackFilters={trackFilters}
          lyricsFullscreen={lyricsFullscreen}
          selectTrackId={selectTrackId}
          trackIdToDownload={trackIdToDownload}
        />
      </Grid>
    </>
  )
}
