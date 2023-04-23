import React, { useContext, useState } from "react";
import { ListItem, ListItemText, IconButton } from "@mui/material";
import purple from "@mui/material/colors/purple";
import { Delete } from "@mui/icons-material";
import IndeterminateCheckbox from "../Styled/IndeterminateCheckbox";
import ServerContext from "../server-context";

export default function PlaylistItem({
  item,
  playlist,
  onClick,
  showConfirmation,
  customPlaylist,
}) {
  const isCustom = !item.uri;
  const { server } = useContext(ServerContext);
  const [favourite] = useState(item.favourite);

  const onCheck = (_e, checked) => {
    server().post(`/api/playlists/${item.uri}`, { favourite: checked });
  };

  return (
    <ListItem
      button
      style={{ color: !item.uri && purple[300] }}
      selected={playlist === item.uri || customPlaylist === item.id}
      onClick={() => {
        onClick(item);
      }}
    >
      <ListItemText primary={item.name} />
      {isCustom && (
        <IconButton size="small" onClick={() => showConfirmation(item.id)}>
          <Delete />
        </IconButton>
      )}
      <IndeterminateCheckbox
        checked={favourite}
        onChange={onCheck}
      ></IndeterminateCheckbox>
    </ListItem>
  );
}
