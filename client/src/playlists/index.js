import React, { useEffect, useState, useRef } from 'react'
import { Grid, TextField } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { get } from '../server'
import PlaylistsList from './List'

function Playlists({ setPlaylist, setRadio, playlist, setTrackId }) {
  const [playlists, setPlaylists] = useState([])
  const [offset, setOffset] = useState()
  const searchRef = useRef(null)

  function init() {
    setOffset(0)
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [])

  function getPlaylists() {
    if (offset === -1) {
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
    setTrackId(null)
    setRadio(`FIP_${Date.now()}`)
  }

  function onPlaylistClick(playlist) {
    if (playlist) {
      setTrackId(null)
      setPlaylist(playlist.uri)
      setRadio(null)
    }
  }

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  const selectedPlaylist = playlists.find((p) => p.uri === playlist)

  return (
    <Grid container direction="column" alignItems="stretch" spacing={1}>
      <Grid item>
        <Button onClick={showFip}>Currently playing on FIP</Button>
      </Grid>
      <Grid item>
        {selectedPlaylist && (
          <Autocomplete
            value={selectedPlaylist}
            onChange={(_, p) => onPlaylistClick(p)}
            autoHighlight
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
          />
        )}
      </Grid>
      <Grid item>
        <PlaylistsList
          playlists={playlists}
          playlist={playlist}
          onPlaylistClick={onPlaylistClick}
        />
      </Grid>
    </Grid>
  )
}

export default Playlists
