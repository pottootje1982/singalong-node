import React, { useEffect, useState, useContext } from 'react'
import { get } from '../server'
import { List, useMediaQuery } from '@material-ui/core'

import TrackItem from './track-item'
import isEquivalent from '../isEquivalent'
import { Track } from '../track'
import PlaylistContext from './playlist-context'
import PlayerContext from '../lyrics/player-context'

export default function Tracks({
  lyricsFullscreen,
  selectTrackId,
  trackFilters,
  trackIdToDownload,
}) {
  const {
    track,
    setTrack,
    trackId,
    setTrackId,
    playlist,
    tracks,
    setTracks,
  } = useContext(PlaylistContext)
  const { player } = useContext(PlayerContext)
  const [offset, setOffset] = useState()
  const [unmounted, setUnmounted] = useState(false)
  const mobile = !useMediaQuery('(min-width:600px)')

  useEffect(selectTrack, [trackId])
  useEffect(addTracks, [offset])
  useEffect(refreshPlaylist, [track])
  useEffect(showPlaylist, [playlist, player])
  useEffect(() => {
    return unmount
  }, [])

  function unmount() {
    setUnmounted(true)
  }

  function showPlaylist() {
    if (playlist && player) {
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
    if (offset === -1) {
      // end of playlist
      selectTrack()
    } else if (playlist && offset >= 0) {
      get(`playlists/${playlist}`, { params: { offset } })
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0 || unmounted) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks.map(Track.copy))
          if (!trackId && offset === 0 && newTracks[0])
            setTrackId(newTracks[0].id)
          setOffset(hasMore ? newTracks.length : -1)
        })
        .catch((err) => console.log(err))
    }
  }

  return (
    <List
      style={{
        maxHeight: !mobile && '40vh',
        overflow: !mobile && 'auto',
        display: lyricsFullscreen && 'none',
      }}
      dense
    >
      {tracks
        .filter((t) => !trackFilters.isNotDownloaded || !t.lyrics)
        .map((t, index) => (
          <TrackItem
            key={index}
            track={t}
            selectTrackId={selectTrackId}
            trackFilters={trackFilters}
            trackIdToDownload={trackIdToDownload}
          />
        ))}
    </List>
  )
}
