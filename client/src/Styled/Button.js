import React from 'react'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'

export default styled(({ ...otherProps }) => (
  <Button
    variant="contained"
    fullWidth
    color="primary"
    {...otherProps}
    style={{
      margin: 5,
      textTransform: 'none',
      ...(otherProps.style || []),
    }}
  />
))``
