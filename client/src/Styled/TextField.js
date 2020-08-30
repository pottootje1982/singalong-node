import React from "react"
import styled from "styled-components"
import TextField from "@material-ui/core/TextField"

export default styled(({ ...otherProps }) => (
  <TextField fullWidth variant="outlined" {...otherProps} />
))``
