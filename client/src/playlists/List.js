import React, { useContext } from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import PlaylistContext from '../playlist/playlist-context'

export default function PlaylistsList({ playlists, onPlaylistClick }) {
  const { playlist } = useContext(PlaylistContext)
  return (
    <List dense style={{ maxHeight: '80vh', overflow: 'auto' }}>
      {playlists.map((p, index) => (
        <ListItem
          key={index}
          button
          selected={playlist && playlist === p.uri}
          onClick={() => {
            onPlaylistClick(p)
          }}
        >
          <ListItemText primary={p.name} />
        </ListItem>
      ))}
    </List>
  )
}
