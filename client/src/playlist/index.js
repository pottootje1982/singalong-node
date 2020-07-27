import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import server, { setToken } from '../server'

export default function Playlist({ playlist, token, user }) {
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
        <ListItem button key={index}>
          <ListItemText primary={`${t.artist} - ${t.title}`} />
        </ListItem>
      ))}
    </List>
  )
}
