import React, { useContext, useState } from 'react'
import { List } from '@mui/material'

import ServerContext from '../server-context'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import ConfirmationDialog from './confirmation-dialog'
import PlaylistItem from './playlist-item'

export default function LibraryList({ playlists, onPlaylistClick }) {
  const { server } = useContext(ServerContext)
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
    server().delete(`/api/playlists/${pIdToDelete}/custom`)
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
      <List dense style={{ maxHeight: 'calc(100vh - 60px)', overflow: 'auto' }}>
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
