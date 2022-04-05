import React from 'react'

import { MenuItem, ListItemIcon, ListItemText } from '@mui/material'

import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@mui/icons-material'

const CheckMenuItem = React.forwardRef(
  ({ setter, state, checked, filterKey, name, close }, ref) => {
    checked = state ? state[filterKey] : checked

    function onCheckClick() {
      if (state) {
        state[filterKey] = !checked
        setter({ ...state }, filterKey)
      } else {
        setter(!checked)
      }
      close && close()
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
