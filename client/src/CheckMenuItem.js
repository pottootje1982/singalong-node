import React from 'react'

import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'

import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@material-ui/icons'

const CheckMenuItem = React.forwardRef(
  ({ setter, checked, name, close }, ref) => {
    function onCheckClick() {
      setter(!checked)
      close()
    }

    return (
      <MenuItem ref={ref} onClick={onCheckClick}>
        <ListItemIcon>
          {checked ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />}
        </ListItemIcon>
        <ListItemText primary={name} />
      </MenuItem>
    )
  }
)

export default CheckMenuItem
