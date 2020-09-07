import React, { useEffect, useState, useRef } from 'react'
import { Grid, TextField } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { setToken, get } from '../server'

function Playlists({ setPlaylist, playlist, setTrackId, token, user }) {
  const [playlists, setPlaylists] = useState([])
  const [offset, setOffset] = useState()
  const searchRef = useRef(null)

  setToken(token)

  function init() {
    if (user) {
      setOffset(0)
    }
  }

  function getPlaylists() {
    if (offset === -1) {
      console.log(searchRef)
      searchRef.current.focus()
    } else if (offset >= 0) {
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

  function onPlaylistClick(event, playlist) {
    if (playlist) {
      setTrackId(null)
      setPlaylist(playlist.uri)
    }
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [user])

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid item>
        <Button onClick={showFip}>Currently playing on FIP</Button>
      </Grid>
      <Grid item>
        <Button onClick={showCurrentlyPlaying}>
          Currently playing on Spotify
        </Button>
      </Grid>
      <Grid item>
        <Autocomplete
          id="combo-box-demo"
          open
          onChange={onPlaylistClick}
          autoHighlight
          style={{ height: '97vh' }}
          options={playlists}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select playlist:"
              inputRef={searchRef}
              variant="outlined"
            />
          )}
          ListboxProps={{
            style: {
              minHeight: '80vh',
            },
          }}
        />{' '}
      </Grid>
    </Grid>
  )
}

export default Playlists
