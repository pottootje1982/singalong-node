import React from 'react'
import styled from 'styled-components'
import IconButton from '@material-ui/core/IconButton'

export default styled(({ ...otherProps }) => (
  <IconButton
    size="small"
    {...otherProps}
    style={{ width: 35, height: 35, marginTop: 6 }}
  />
))``
