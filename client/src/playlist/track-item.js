import React, { useContext } from 'react'
import { spotifyAxios } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import {
  IconButton,
  ListItem,
  ListItemText,
  useMediaQuery,
} from '@material-ui/core'
import { PlayArrow, QueueMusic, Add } from '@material-ui/icons'
import usePlayTrack from '../lyrics/player-hooks'
import PlaylistContext from './playlist-context'
import PlayerContext from '../lyrics/player-context'

export default function TrackItem({
  track,
  selectTrackId,
  trackFilters,
  trackIdToDownload,
}) {
  const { trackId, radio, playlist } = useContext(PlaylistContext)
  const { setMonitorCurrentlyPlaying } = useContext(PlayerContext)
  const playTrack = usePlayTrack()

  const mobile = !useMediaQuery('(min-width:600px)')

  function addTrackToPlaylist(uri) {
    const [, , id] = playlist.split(':')
    console.log(uri)
    spotifyAxios
      .post(`/playlists/${id}/tracks`, {
        uris: [uri],
      })
      .then(console.log)
  }

  function onClickTrack(track) {
    setMonitorCurrentlyPlaying(false)
    selectTrackId(track)
  }

  function queueTrack(uri) {
    spotifyAxios.post(`/me/player/queue?uri=${uri}`)
  }

  return (
    <ListItem
      button
      selected={track.id === trackId}
      autoFocus={!mobile && track.id === trackId}
      onClick={() => onClickTrack(track)}
      onDoubleClick={() => playTrack(track.uri)}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {mobile && track.uri && (
          <IconButton
            size="small"
            style={{ width: 25, height: 25 }}
            onClick={() => playTrack(track.uri)}
          >
            <PlayArrow></PlayArrow>
          </IconButton>
        )}
        {track.uri && (
          <IconButton
            size="small"
            style={{ width: 25, height: 25 }}
            onClick={() => queueTrack(track.uri)}
          >
            <QueueMusic></QueueMusic>
          </IconButton>
        )}
        {track.uri && radio && (
          <IconButton
            size="small"
            style={{ width: 25, height: 25 }}
            onClick={() => addTrackToPlaylist(track.uri)}
          >
            <Add></Add>
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
