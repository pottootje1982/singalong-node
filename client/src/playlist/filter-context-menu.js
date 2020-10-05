import React, { useState } from 'react'
import { Menu, IconButton, Divider } from '@material-ui/core'
import CheckMenuItem from '../CheckMenuItem'
import { Menu as MenuIcon } from '@material-ui/icons'
import CustomPlaylist from './custom-playlist'

export default function FilterContextMenu({ trackFilters, setTrackFilters }) {
  const [anchorEl, setAnchorEl] = useState()

  const defaultMenuItemProps = {
    setter: setTrackFilters,
    state: trackFilters,
    close: closeMenu,
  }

  function closeMenu() {
    setAnchorEl(null)
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
