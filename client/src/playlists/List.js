import React from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'

function PlaylistItem({ uri, name, playlist, onClick }) {
  return (
    <ListItem
      button
      selected={uri && uri === playlist}
      onClick={() => {
        onClick(uri)
      }}
    >
      <ListItemText
        primary={name}
        style={{
          color: name.match(/currently playing/gi),
        }}
      />
    </ListItem>
  )
}

export default function PlaylistsList({
  playlists,
  playlist,
  onPlaylistClick,
}) {
  return (
    <List dense style={{ maxHeight: '80vh', overflow: 'auto' }}>
      {playlists.map((p, index) => (
        <PlaylistItem
          key={index}
          uri={p.uri}
          name={p.name}
          playlist={playlist}
          onClick={onPlaylistClick}
        />
      ))}
    </List>
  )
}
