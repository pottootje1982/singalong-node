import React, { useContext, useState } from 'react'
import { List, ListItem, ListItemText, IconButton } from '@material-ui/core'
import purple from '@material-ui/core/colors/purple'
import { Delete } from '@material-ui/icons'

import server from '../server'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import ConfirmationDialog from './confirmation-dialog'

function PlaylistItem({
  item,
  playlist,
  onClick,
  showConfirmation,
  customPlaylist,
}) {
  const isCustom = !item.uri

  return (
    <ListItem
      button
      style={{ color: !item.uri && purple[300] }}
      selected={playlist === item.uri || customPlaylist === item.id}
      onClick={() => {
        onClick(item)
      }}
    >
      <ListItemText primary={item.name} />
      {isCustom && (
        <IconButton size="small" onClick={() => showConfirmation(item.id)}>
          <Delete />
        </IconButton>
      )}
    </ListItem>
  )
}

export default function LibraryList({ playlists, onPlaylistClick }) {
  const { customPlaylists, setCustomPlaylists } = useContext(LibraryContext)
  const { playlist, customPlaylist } = useContext(PlaylistContext)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [playlistName, setPlaylistName] = useState()
  const [pIdToDelete, setpIdToDelete] = useState()

  function showConfirmation(playlistId) {
    setpIdToDelete(playlistId)
    const selectedCp = customPlaylists.find((p) => p.id === playlistId)
    setPlaylistName(selectedCp.name)
    setDialogOpen(true)
  }

  function onPlaylistDelete() {
    server.delete(`/api/playlists/${pIdToDelete}/custom`)
    setCustomPlaylists(customPlaylists.filter((p) => p.id !== pIdToDelete))
  }

  return (
    <>
      <ConfirmationDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        title={'Remove custom playlist'}
        message={`Are you sure you want to remove ${playlistName}`}
        onOk={onPlaylistDelete}
      />
      <List dense style={{ maxHeight: '80vh', overflow: 'auto' }}>
        {playlists.map((p, index) => (
          <PlaylistItem
            key={index}
            item={p}
            playlist={playlist}
            onClick={onPlaylistClick}
            customPlaylist={customPlaylist}
            showConfirmation={showConfirmation}
          />
        ))}
      </List>
    </>
  )
}
