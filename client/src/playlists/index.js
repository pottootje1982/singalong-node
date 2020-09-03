import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { setToken, get } from '../server'
import purple from '@material-ui/core/colors/purple'

function Playlists({ setPlaylist, playlist, token, user }) {
  const [playlists, setPlaylists] = useState([])

  setToken(token)

  function init() {
    user &&
      Promise.all([
        get('playlists/currently-playing'),
        get(`playlists?user=${user}`),
      ]).then(([{ data }, rest]) => {
        setPlaylists([...data, ...rest.data])
      })
  }

  useEffect(init, [user])

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  return (
    <List dense style={{ maxHeight: '97vh', overflow: 'auto' }}>
      {playlists.map((p, index) => (
        <ListItem
          button
          key={index}
          selected={p.uri === playlist}
          onClick={() => {
            setPlaylist(p.uri)
          }}
        >
          <ListItemText
            primary={p.name}
            style={{
              color: p.name.match(/currently playing/gi) && purple[500],
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default Playlists
