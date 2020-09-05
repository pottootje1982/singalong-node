import React from 'react'

import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'

import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@material-ui/icons'

export default function CheckMenuItem({ setter, checked, name, close }) {
  function onCheckClick() {
    setter(!checked)
    close()
  }

  return (
    <MenuItem onClick={onCheckClick}>
      <ListItemIcon>
        {checked ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />}
      </ListItemIcon>
      <ListItemText primary={name} />
    </MenuItem>
  )
}
