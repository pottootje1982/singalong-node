import React from "react";
import styled from "styled-components";
import IconButton from "@mui/material/IconButton";

export default styled(({ ...otherProps }) => (
  <IconButton
    size="small"
    {...otherProps}
    style={{ width: 35, height: 35, marginTop: 6 }}
  />
))``;
