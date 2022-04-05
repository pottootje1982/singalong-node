import React, { useState } from 'react'
import { Menu, IconButton, Divider } from '@mui/material'
import CheckMenuItem from '../CheckMenuItem'
import { Menu as MenuIcon } from '@mui/icons-material'
import CustomPlaylist from './custom-playlist'

export default function FilterContextMenu({ trackFilters, setTrackFilters }) {
  const [anchorEl, setAnchorEl] = useState()

  function closeMenu() {
    setAnchorEl(null)
  }

  const setTrackFiltersWrapper = (state, filterKey) => {
    console.log(state, filterKey)
    if (filterKey === 'isNotDownloaded' && state.isNotDownloaded) {
      state.isDownloaded = false
    }
    else if (filterKey === 'isDownloaded' && state.isDownloaded) {
      state.isNotDownloaded = false
    }
    setTrackFilters({...state})
  }

  const defaultMenuItemProps = {
    setter: setTrackFiltersWrapper,
    state: trackFilters,
    close: closeMenu,
  }

  return (
    <React.Fragment>
      <IconButton
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        label="label"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
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
          {...defaultMenuItemProps}
          filterKey="minimalTitle"
          name="Minimize title"
        />
        <CheckMenuItem
          {...defaultMenuItemProps}
          filterKey="isNotDownloaded"
          name="Not downloaded"
        />
        <CheckMenuItem
          {...defaultMenuItemProps}
          filterKey="isDownloaded"
          name="Downloaded"
        />
        <CheckMenuItem
          {...defaultMenuItemProps}
          filterKey="hideArtist"
          name="Hide artist"
        />
        <Divider></Divider>
        <CustomPlaylist closeMenu={closeMenu}></CustomPlaylist>
        <CustomPlaylist closeMenu={closeMenu} edit={true}></CustomPlaylist>
      </Menu>
    </React.Fragment>
  )
}
