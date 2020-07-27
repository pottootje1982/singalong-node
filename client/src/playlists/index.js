import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import server, { setToken } from '../server'

function Playlists({ setPlaylist, token }) {
  const [playlists, setPlaylists] = useState([])

  setToken(token)

  useEffect(() => {
    server
      .get('v2/playlists')
      .then((res) => {
        setPlaylists(res.data)
      })
      .catch((err) => console.log(err))
  }, [])

  return (
    <List dense style={{ maxHeight: '100vh', overflow: 'auto' }}>
      {playlists.map((p) => (
        <ListItem
          button
          key={p.id}
          onClick={() => {
            setPlaylist(p.id)
          }}
        >
          <ListItemText primary={p.name} />
        </ListItem>
      ))}
    </List>
  )
}

export default Playlists
