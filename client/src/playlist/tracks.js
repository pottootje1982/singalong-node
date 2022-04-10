import React, { useEffect, useState, useContext } from 'react'
import ServerContext from '../server-context'
import { List, useMediaQuery } from '@mui/material'

import TrackItem from './track-item'
import isEquivalent from '../isEquivalent'
import { Track } from '../track'
import PlaylistContext from './playlist-context'
import PlayerContext from '../player/player-context'
import AddToPlaylistMenu from './add-to-playlist-menu'
import DownloadContext from '../lyrics/download-context'

const initialState = {
  mouseX: null,
  mouseY: null,
}

export default function Tracks({
  lyricsFullscreen,
  selectTrackId,
  trackFilters,
}) {
  const { server } = useContext(ServerContext)
  const {
    track,
    setTrack,
    trackId,
    setTrackId,
    playlist,
    radio,
    customPlaylist,
    tracks,
    setTracks,
    initialized,
    lyricsHeight,
    urlCurrentlyPlaying
  } = useContext(PlaylistContext)
  const { trackIdToDownload } = useContext(DownloadContext)
  const { setMonitorCurrentlyPlaying, isPlaying } = useContext(PlayerContext)
  const [offset, setOffset] = useState()
  const [unmounted, setUnmounted] = useState(false)
  const mobile = !useMediaQuery('(min-width:600px)')
  const [state, setState] = useState(initialState)

  useEffect(selectTrack, [trackId, setTrack, tracks])
  useEffect(addTracks, [offset, isPlaying, playlist, server, setTrackId, setTracks, trackId, tracks, unmounted])
  useEffect(refreshPlaylist, [track, setTracks, tracks])
  useEffect(showPlaylist, [playlist, initialized, setTrack, setTracks])
  useEffect(init, [initialized, customPlaylist, playlist, radio, setMonitorCurrentlyPlaying, urlCurrentlyPlaying])
  useEffect(() => {
    return unmount
  }, [])

  function init() {
    if (initialized && !urlCurrentlyPlaying && (radio || playlist || customPlaylist)) {
      setMonitorCurrentlyPlaying(false)
    }
  }

  function unmount() {
    setUnmounted(true)
  }

  function showPlaylist() {
    if (playlist && initialized) {
      setTrack() // To fix error 'Material-UI: The value provided to Autocomplete is invalid. None of the options match with ...'
      setTracks([])
      setOffset(0)
    }
  }

  function selectTrack() {
    const trackToSelect = tracks.find((t) => t.id === trackId)
    setTrack(trackToSelect || tracks[0])
  }

  function refreshPlaylist() {
    if (track && track.id) {
      const foundTrack = tracks.find((t) => t.id === track.id)
      if (foundTrack) {
        if (!isEquivalent(track, foundTrack)) {
          foundTrack.lyrics = track.lyrics
          setTracks([...tracks])
        }
      }
    }
  }

  function addTracks() {
    if (playlist && offset >= 0) {
      server()
        .get(`/api/playlists/${playlist}`, { params: { offset } })
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0 || unmounted) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks.map(Track.copy))
          if (!trackId && offset === 0 && newTracks[0] && isPlaying === false)
            setTrackId(newTracks[0].id)
          setOffset(hasMore ? newTracks.length : -1)
        })
        .catch((err) => console.log(err))
    }
  }

  return (
    <>
      <List
        style={{
          overflow: !mobile && 'auto',
          display: lyricsFullscreen && 'none',
          maxHeight: `calc(100vh - ${lyricsHeight + 20}px)`
        }}
        dense
      >
        {tracks
          .filter((t) => !trackFilters.isNotDownloaded || !t.lyrics)
          .filter((t) => !trackFilters.isDownloaded || t.lyrics)
          .map((t, index) => (
            <TrackItem
              key={index}
              track={t}
              selectTrackId={selectTrackId}
              trackFilters={trackFilters}
              trackIdToDownload={trackIdToDownload}
              setState={setState}
            />
          ))}
      </List>
      <AddToPlaylistMenu
        state={state}
        setState={setState}
        initialState={initialState}
      ></AddToPlaylistMenu>
    </>
  )
}
