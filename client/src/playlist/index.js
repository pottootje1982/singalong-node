import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import server, { setToken } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'

export default function Playlist({ playlist, token, user, setTrack }) {
  const [tracks, setTracks] = useState([])
  const [offset, setOffset] = useState()

  setToken(token)

  function init() {
    playlist && user && getPlaylist()
  }

  useEffect(init, [])
  useEffect(getPlaylist, [offset])

  function getPlaylist() {
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

  return (
    <List style={{ maxHeight: '50vh', overflow: 'auto' }} dense>
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
