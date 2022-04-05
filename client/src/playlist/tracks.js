import React, { useEffect, useState, useContext } from 'react'
import ServerContext from '../server-context'
import { List, useMediaQuery } from '@material-ui/core'

import TrackItem from './track-item'
import isEquivalent from '../isEquivalent'
import { Track } from '../track'
import PlaylistContext, { getPlaylist } from './playlist-context'
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
    setPlaylist,
    tracks,
    setTracks,
    setRadio,
    setCustomPlaylist,
  } = useContext(PlaylistContext)
  const { trackIdToDownload } = useContext(DownloadContext)
  const { player, setMonitorCurrentlyPlaying, isPlaying } = useContext(PlayerContext)
  const [offset, setOffset] = useState()
  const [unmounted, setUnmounted] = useState(false)
  const mobile = !useMediaQuery('(min-width:600px)')
  const [state, setState] = useState(initialState)

  useEffect(selectTrack, [trackId])
  useEffect(addTracks, [offset])
  useEffect(refreshPlaylist, [track])
  useEffect(showPlaylist, [playlist, player])
  useEffect(init, [player])
  useEffect(() => {
    return unmount
  }, [])

  function init() {
    if (player) {
      const { urlRadio, urlPlaylist, urlCustomPlaylist, urlCurrentlyPlaying } = getPlaylist()
      if (urlRadio || urlPlaylist || urlCustomPlaylist) {
        setMonitorCurrentlyPlaying(false)
      }
      setPlaylist(null)
      setCustomPlaylist(null)
      setRadio(null)
      setTrackId(null)
      if (urlRadio) setRadio({ urlRadio })
      else if (urlCustomPlaylist) setCustomPlaylist(urlCustomPlaylist)
      else setPlaylist(urlCurrentlyPlaying || urlPlaylist)
    }
  }

  function unmount() {
    setUnmounted(true)
  }

  function showPlaylist() {
    if (playlist && player) {
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
    if (offset === -1) {
      // end of playlist
      selectTrack()
    } else if (playlist && offset >= 0) {
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
          maxHeight: !mobile && '40vh',
          overflow: !mobile && 'auto',
          display: lyricsFullscreen && 'none',
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
