import React, { useState, useEffect, useContext } from 'react'
import { IconButton } from '@material-ui/core'
import ServerContext from '../server-context'
import { Menu, Divider } from '@material-ui/core'
import { Menu as MenuIcon } from '@material-ui/icons'
import CheckMenuItem from '../CheckMenuItem'
import { Track } from '../track'
import CustomSearch from './custom-search'
import IconMenuItem from './icon-menu-item'
import PlayerContext from '../player/player-context'
import PlaylistContext from '../playlist/playlist-context'
import ThemeContext from '../theme-context'

export default function LyricsMenu({
  lyricsRef,
  trackFilters,
  downloadLyrics,
}) {
  const { server } = useContext(ServerContext)
  const [anchorEl, setAnchorEl] = useState()
  const [darkMode, setDarkMode] = useState(
    window.localStorage.getItem('dark-or-light') === 'dark'
  )
  const { monitorCurrentlyPlaying, setMonitorCurrentlyPlaying } = useContext(
    PlayerContext
  )
  const { track, setTrack } = useContext(PlaylistContext)
  const { setThemeName } = useContext(ThemeContext)

  function saveLyrics() {
    const lyrics = lyricsRef.current.value
    server().post('/api/lyrics', { track, lyrics })
    track.lyrics = lyrics
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function removeLyrics() {
    track.lyrics = null
    server().delete('/api/lyrics', { data: { track } })
    setTrack(Track.copy({ ...track }))
    closeMenu()
  }

  function searchLyrics() {
    const artist = trackFilters.hideArtist ? '' : `${track.cleanArtist()}+`
    const title = track.getTitle(trackFilters.minimalTitle)
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

  function saveDarkMode() {
    setThemeName(darkMode ? 'dark' : 'light')
  }

  useEffect(saveDarkMode, [darkMode])

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
          setter={setMonitorCurrentlyPlaying}
          checked={monitorCurrentlyPlaying}
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
        <Divider />
        <CheckMenuItem
          setter={setDarkMode}
          checked={darkMode}
          name="Dark mode"
          close={closeMenu}
        />
      </Menu>
    </>
  )
}
