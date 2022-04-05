import React, { useState, useEffect, useContext } from 'react'
import { IconButton } from '@mui/material'
import ServerContext from '../server-context'
import { Menu, Divider } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import CheckMenuItem from '../CheckMenuItem'
import { Track } from '../track'
import CustomSearch, { CustomSearchDialog } from './custom-search'
import IconMenuItem from './icon-menu-item'
import PlayerContext from '../player/player-context'
import PlaylistContext from '../playlist/playlist-context'
import ThemeContext from '../theme-context'
import DownloadContext from './download-context'

export default function LyricsMenu({
  lyricsRef,
  trackFilters,
}) {
  const { server } = useContext(ServerContext)
  const { downloadTrack } = useContext(DownloadContext)

  const [anchorEl, setAnchorEl] = useState()
  const [darkMode, setDarkMode] = useState(
    window.localStorage.getItem('dark-or-light') === 'dark'
  )
  const { monitorCurrentlyPlaying, setMonitorCurrentlyPlaying } = useContext(
    PlayerContext
  )
  const { track, setTrack } = useContext(PlaylistContext)
  const { setThemeName } = useContext(ThemeContext)
  const { sites, setSites } = useContext(DownloadContext)
  const [customSearchOpen, setCustomSearchOpen] = useState(false)

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
    downloadTrack(track).then(lyrics => { if (!lyrics) alert(`Could not find lyrics for ${track.toString()}`) })
  }

  function saveDarkMode() {
    setThemeName(darkMode ? 'dark' : 'light')
  }

  function onSiteActiveClick(site, active) {
    site.disabled = !active
    setSites([...sites])
  }

  useEffect(saveDarkMode, [darkMode])

  return (
    <>
      <CustomSearchDialog modalOpen={customSearchOpen}
        setModalOpen={setCustomSearchOpen}
        trackFilters={trackFilters}
        closeMenu={closeMenu}
      />
      <IconButton
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        label="label"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        disableAutoFocusItem={false}
        anchorEl={anchorEl}
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
        />
        <Divider />
        {sites.map(s => (
          <CheckMenuItem
            key={s.name}
            checked={!s.disabled}
            setter={checked => onSiteActiveClick(s, checked)}
            name={s.name}
            close={closeMenu}
          />
        ))}
        <Divider />
        <IconMenuItem
          onClick={saveLyrics}
          icon="Save"
          text="Save"
        />
        <IconMenuItem
          onClick={removeLyrics}
          icon="Delete"
          text="Remove"
        />
        <Divider />
        <IconMenuItem
          onClick={searchLyrics}
          icon="Search"
          text="Search with Google"
        />
        <CustomSearch
          setModalOpen={setCustomSearchOpen}
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
