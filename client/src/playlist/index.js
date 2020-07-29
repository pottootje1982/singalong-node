import React, { useEffect, useState } from 'react'
import server, { setToken } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import { IconButton, ListItem, ListItemText, List } from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'

export default function Playlist({ playlist, token, user, setTrack }) {
  const [tracks, setTracks] = useState([])
  const [offset, setOffset] = useState()

  setToken(token)

  useEffect(getPlaylist, [offset])

  function getPlaylist() {
    if (user && playlist) {
      const offsetQuery = offset ? `?offset=${offset}` : ''
      server
        .get(`v2/playlists/${playlist}/users/${user}${offsetQuery}`)
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (newTracks.length === 0) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks)
          if (hasMore) {
            setOffset(newTracks.length)
          }
        })
        .catch((err) => console.log(err))
    }
  }

  function playTrack(id) {
    server.get(`v2/player/${id}?user=${user}&playlist=${playlist}`)
  }

  return (
    <List style={{ maxHeight: '50vh', overflow: 'auto' }} dense>
      {tracks.map((t, index) => (
        <ListItem button key={index} onClick={() => setTrack(t)}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <IconButton
              size="small"
              style={{ width: 25, height: 25 }}
              onClick={() => playTrack(t.id)}
            >
              <PlayIcon></PlayIcon>
            </IconButton>
            <ListItemText
              primary={`${t.artist} - ${t.title}`}
              style={{ color: t.lyrics ? green[500] : red[500] }}
            />
          </div>
        </ListItem>
      ))}
    </List>
  )
}
