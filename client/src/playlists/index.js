import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { setToken, get } from '../server'
import purple from '@material-ui/core/colors/purple'

function PlaylistItem({ uri, name, playlist, onClick }) {
  return (
    <ListItem
      button
      selected={uri && uri === playlist}
      onClick={() => {
        onClick(uri)
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

function Playlists({ setPlaylist, playlist, setTrackId, token, user }) {
  const [playlists, setPlaylists] = useState([])
  const [offset, setOffset] = useState()

  setToken(token)

  function init() {
    if (user) {
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

  function showFip() {
    setPlaylist(`FIP_${Date.now()}`)
  }

  function showCurrentlyPlaying() {
    get('playlists/currently-playing').then(({ data }) => {
      setPlaylist(data.uri)
    })
  }

  function onPlaylistClick(uri) {
    setTrackId(null)
    setPlaylist(uri)
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [user])

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  return (
    <List dense style={{ maxHeight: '97vh', overflow: 'auto' }}>
      <PlaylistItem
        name="Currently playing on FIP"
        onClick={showFip}
      ></PlaylistItem>
      <PlaylistItem
        name="Currently playing on Spotify"
        onClick={showCurrentlyPlaying}
      ></PlaylistItem>

      {playlists.map((p, index) => (
        <PlaylistItem
          key={index}
          uri={p.uri}
          name={p.name}
          playlist={playlist}
          onClick={onPlaylistClick}
        />
      ))}
    </List>
  )
}

export default Playlists
