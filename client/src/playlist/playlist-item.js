import React, { useContext } from 'react'
import server from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import { IconButton, ListItem, ListItemText } from '@material-ui/core'
import { PlayArrow, PlaylistAdd } from '@material-ui/icons'
import usePlayTrack from './play-track'
import PlaylistContext from './playlist-context'

export default function PlaylistItem({
  track,
  selectTrackId,
  trackFilters,
  trackIdToDownload,
}) {
  const { trackId, radio, playlist, tracks } = useContext(PlaylistContext)
  const playTrack = usePlayTrack({ tracks })

  function addTrackToPlaylist(uri) {
    server.post(`/playlists/${playlist}/tracks`, { uris: [uri] })
  }

  return (
    <ListItem
      button
      selected={track.id === trackId}
      autoFocus={track.id === trackId}
      onClick={() => selectTrackId(track)}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {track.uri && (
          <IconButton
            size="small"
            style={{ width: 25, height: 25 }}
            onClick={() => playTrack(track.uri)}
          >
            <PlayArrow></PlayArrow>
          </IconButton>
        )}
        {track.uri && radio && (
          <IconButton
            size="small"
            style={{ width: 25, height: 25 }}
            onClick={() => addTrackToPlaylist(track.uri)}
          >
            <PlaylistAdd></PlaylistAdd>
          </IconButton>
        )}
        <ListItemText
          primary={track.toString(trackFilters)}
          style={{
            color:
              track.id === trackIdToDownload && track.id
                ? orange[500]
                : track.lyrics
                ? green[500]
                : red[500],
          }}
        />
      </div>
    </ListItem>
  )
}
