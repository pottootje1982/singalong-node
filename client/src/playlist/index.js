import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import server from '../server'

export default function Playlist({ playlist }) {
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    playlist &&
      server
        .get(`v2/playlist/${playlist}`)
        .then((res) => {
          setTracks(res.data)
        })
        .catch((err) => console.log(err))
  }, [playlist])

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
