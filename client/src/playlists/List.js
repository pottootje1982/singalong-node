import React, { useContext } from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import PlaylistContext from '../playlist/playlist-context'
import purple from '@material-ui/core/colors/purple'

export default function PlaylistsList({ playlists, onPlaylistClick }) {
  const { playlist, customPlaylist } = useContext(PlaylistContext)

  return (
    <List dense style={{ maxHeight: '80vh', overflow: 'auto' }}>
      {playlists.map((p, index) => (
        <ListItem
          key={index}
          button
          style={{ color: !p.uri && purple[300] }}
          selected={playlist === p.uri || customPlaylist === p.id}
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
