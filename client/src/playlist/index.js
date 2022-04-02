import React, { useEffect, useContext } from 'react'
import ServerContext from '../server-context'
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
  const { server } = useContext(ServerContext)
  const { setTrackId, radio, customPlaylist, setTracks, playlist } = useContext(
    PlaylistContext
  )

  function showAndSearchPlaylist(url) {
    setTracks([])
    return server().get(url).then(({ data }) => {
      const { tracks } = data || {}
      if (!tracks) return
      setTracks(tracks.map(Track.copy))
      setTrackId(tracks[0].id)
      server()
        .post('/api/spotify/search', { tracks })
        .then(({ data: { tracks: foundTracks } }) => {
          setTracks((foundTracks || []).map(Track.copy))
        })
      return data
    })
  }

  useEffect(showCustomPlaylist, [customPlaylist])
  function showCustomPlaylist() {
    if (customPlaylist) {
      showAndSearchPlaylist(`/api/playlists/${customPlaylist}/custom`)
    }
  }

  useEffect(showCurrentlyOnFip, [radio])
  function showCurrentlyOnFip() {
    if (radio) {
      setTrackId()
      showAndSearchPlaylist('/api/radio/fip').then((data) => {
        const { position, tracks } = data || {}
        setTrackId(tracks[position].id)
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
          lyricsFullscreen={lyricsFullscreen}
        />
      </Grid>
      <Grid item>
        <Tracks
          key={playlist}
          trackFilters={trackFilters}
          lyricsFullscreen={lyricsFullscreen}
          selectTrackId={selectTrackId}
        />
      </Grid>
    </>
  )
}
