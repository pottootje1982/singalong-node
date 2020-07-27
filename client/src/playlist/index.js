import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import server, { setToken } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'

export default function Playlist({ playlist, token, user, setTrack }) {
  const [tracks, setTracks] = useState([])

  setToken(token)

  useEffect(() => {
    playlist &&
      user &&
      server
        .get(`v2/playlists/${playlist}/users/${user}`)
        .then((res) => {
          setTracks(res.data || [])
        })
        .catch((err) => console.log(err))
  }, [playlist, user])

  return (
    <List style={{ maxHeight: '100vh', overflow: 'auto' }} dense>
      {tracks.map((t, index) => (
        <ListItem button key={index} onClick={() => setTrack(t)}>
          <ListItemText
            primary={`${t.artist} - ${t.title}`}
            style={{ color: t.lyrics ? green[500] : red[500] }}
          />
        </ListItem>
      ))}
    </List>
  )
}
