import React from 'react'

import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'

import {
  Menu as MenuIcon,
  GetApp as DownloadIcon,
  Delete,
  Save,
  Search,
} from '@material-ui/icons'

const icons = {
  MenuIcon: <MenuIcon fontSize="small"></MenuIcon>,
  DownloadIcon: <DownloadIcon fontSize="small" />,
  Delete: <Delete fontSize="small"></Delete>,
  Save: <Save fontSize="small" />,
  Search: <Search fontSize="small" />,
}

export default function IconListItem({ onClick, icon, text }) {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon>{icons[icon]}</ListItemIcon>
      <ListItemText primary={text} />
    </MenuItem>
  )
}
