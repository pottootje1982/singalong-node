import React, { useEffect, useState } from 'react'
import { get } from '../server'
import { List, useMediaQuery } from '@material-ui/core'
import PlaylistItem from './playlist-item'
import isEquivalent from '../isEquivalent'
import { Track } from '../track'

export default function Tracks({
  lyricsFullscreen,
  trackId,
  setTrackId,
  selectTrackId,
  track,
  setTrack,
  playlist,
  tracks,
  setTracks,
  trackFilters,
  trackIdToDownload,
  radio,
}) {
  const [offset, setOffset] = useState()
  const mobile = !useMediaQuery('(min-width:600px)')

  useEffect(selectTrack, [trackId])
  useEffect(addTracks, [offset])
  useEffect(refreshPlaylist, [track])
  useEffect(showPlaylist, [playlist])

  function showPlaylist() {
    if (playlist) {
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
          if (!newTracks || newTracks.length === 0) return
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
      key={playlist}
      style={{
        maxHeight: '40vh',
        overflow: 'auto',
        display: (mobile || lyricsFullscreen) && 'none',
      }}
      dense
    >
      {tracks
        .filter((t) => !trackFilters.isNotDownloaded || !t.lyrics)
        .map((t, index) => (
          <PlaylistItem
            key={index}
            track={t}
            trackId={trackId}
            selectTrackId={selectTrackId}
            trackFilters={trackFilters}
            trackIdToDownload={trackIdToDownload}
            playlist={playlist}
            radio={radio}
            tracks={tracks}
          />
        ))}
    </List>
  )
}