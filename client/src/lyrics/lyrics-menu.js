import React, { useState, useEffect, useContext } from 'react'
import { IconButton } from '@material-ui/core'
import { post, del } from '../server'
import { Menu, Divider } from '@material-ui/core'
import { Menu as MenuIcon } from '@material-ui/icons'
import CheckMenuItem from '../CheckMenuItem'
import { Track } from '../track'
import CustomSearch from './custom-search'
import IconMenuItem from './icon-menu-item'
import PlayerContext from '../playlist/player-context'
import PlaylistContext from '../playlist/playlist-context'

export default function LyricsMenu({
  lyricsRef,
  trackFilters,
  showCurrentlyPlayingTrack,
  downloadLyrics,
}) {
  const [anchorEl, setAnchorEl] = useState()
  const [currentlyPlayingProbe, setCurrentlyPlayingProbe] = useState()
  const {
    showCurrentlyPlaying,
    setShowCurrentlyPlaying,
    isPlaying,
  } = useContext(PlayerContext)
  const { track, setTrack } = useContext(PlaylistContext)

  useEffect(setOrClearProbe, [showCurrentlyPlaying])
  useEffect(initMonitoring, [])

  // Start monitoring on startup if Spotify is already playing
  function initMonitoring() {
    showCurrentlyPlayingTrack().then((track) => {
      if (track && track.is_playing) {
        setShowCurrentlyPlaying(true)
      }
    })
  }

  function setOrClearProbe() {
    closeMenu()
    if (showCurrentlyPlaying) {
      const probe = setInterval(showCurrentlyPlayingTrack, 1000)
      setCurrentlyPlayingProbe(probe)
    } else {
      clearInterval(currentlyPlayingProbe)
    }
  }

  function saveLyrics() {
    const lyrics = lyricsRef.current.value
    post('/lyrics', { track, lyrics })
    track.lyrics = lyrics
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function removeLyrics() {
    track.lyrics = null
    del('/lyrics', { data: { track } })
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function searchLyrics() {
    const artist = trackFilters.hideArtist ? '' : `${track.artist}+`
    const title = track.getTitle(trackFilters)
    const query = `${artist}${title}`.replace('&', '')
    window.open(`https://www.google.com/search?q=${query}+lyrics`, '_blank')
    closeMenu()
  }

  function closeMenu() {
    setAnchorEl(null)
  }

  function downloadAndClose() {
    closeMenu()
    downloadLyrics(track)
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        label="label"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={!!anchorEl}
        onClose={closeMenu}
      >
        <CheckMenuItem
          setter={setShowCurrentlyPlaying}
          checked={showCurrentlyPlaying}
          name="Monitor currently playing track"
          close={closeMenu}
        />
        <IconMenuItem
          onClick={downloadAndClose}
          icon="DownloadIcon"
          text="Download lyrics"
        ></IconMenuItem>
        <Divider />
        <IconMenuItem
          onClick={saveLyrics}
          icon="Save"
          text="Save"
        ></IconMenuItem>
        <IconMenuItem
          onClick={removeLyrics}
          icon="Delete"
          text="Remove"
        ></IconMenuItem>
        <Divider />
        <IconMenuItem
          onClick={searchLyrics}
          icon="Search"
          text="Search with Google"
        ></IconMenuItem>
        <CustomSearch
          trackFilters={trackFilters}
          downloadLyrics={downloadLyrics}
          closeMenu={closeMenu}
        />
      </Menu>
    </>
  )
}
