import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { setToken, get } from '../server'
import purple from '@material-ui/core/colors/purple'

function PlaylistItem({ uri, name, playlist, setPlaylist }) {
  return (
    <ListItem
      button
      selected={uri === playlist}
      onClick={() => {
        setPlaylist(uri)
      }}
    >
      <ListItemText
        primary={name}
        style={{
          color: name.match(/currently playing/gi) && purple[500],
        }}
      />
    </ListItem>
  )
}

function Playlists({ setPlaylist, playlist, token, user }) {
  const [playlists, setPlaylists] = useState([])
  const [offset, setOffset] = useState()
  const [currentlyPlaying, setCurrentlyPlaying] = useState()

  setToken(token)

  function init() {
    if (user) {
      get('playlists/currently-playing').then(({ data }) => {
        setCurrentlyPlaying(data)
      })
      setOffset(0)
    }
  }

  function getPlaylists() {
    if (offset >= 0) {
      get(`playlists`, { params: { offset, limit: 50 } }).then(
        ({ data: { playlists: newPlaylists, hasMore } }) => {
          const items = [...playlists, ...newPlaylists]
          setPlaylists(items)
          setOffset(hasMore ? items.length : -1)
        }
      )
    }
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [user])

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  return (
    <List dense style={{ maxHeight: '97vh', overflow: 'auto' }}>
      <PlaylistItem
        uri={'FIP'}
        name="Show currently playing on FIP"
        setPlaylist={setPlaylist}
      ></PlaylistItem>
      {currentlyPlaying && (
        <PlaylistItem
          uri={currentlyPlaying.uri}
          name={currentlyPlaying.name}
          setPlaylist={setPlaylist}
        ></PlaylistItem>
      )}
      {playlists.map((p, index) => (
        <PlaylistItem
          key={index}
          uri={p.uri}
          name={p.name}
          playlist={playlist}
          setPlaylist={setPlaylist}
        />
      ))}
    </List>
  )
}

export default Playlists
