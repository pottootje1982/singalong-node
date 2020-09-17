import React, { useEffect, useState, useRef, useContext } from 'react'
import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { get } from '../server'
import PlaylistsList from './List'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'

export default function Library({ getFreshToken }) {
  const [offset, setOffset] = useState()
  const searchRef = useRef(null)
  const mobile = !useMediaQuery('(min-width:600px)')
  const {
    setTrackId,
    playlist,
    setPlaylist,
    setRadio,
    setCustomPlaylist,
  } = useContext(PlaylistContext)
  const {
    playlists,
    setPlaylists,
    customPlaylists,
    setCustomPlaylists,
  } = useContext(LibraryContext)

  function init() {
    setOffset(0)
    getCustomPlaylists()
    setInterval(() => {
      getFreshToken()
    }, 3600 * 1000)
  }

  function getCustomPlaylists() {
    get('playlists/custom').then(({ data: { playlists } }) => {
      setCustomPlaylists(playlists)
    })
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [])

  function getPlaylists() {
    if (offset === -1) {
      searchRef.current.focus()
    } else if (offset >= 0) {
      get(`playlists`, { params: { offset, limit: 50 } }).then(
        ({ data: { playlists: newPlaylists, hasMore } }) => {
          if (!newPlaylists) return
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
      setRadio(null)
      if (playlist.uri) {
        setCustomPlaylist(null)
        setPlaylist(playlist.uri)
      } else if (playlist.id) {
        setPlaylist(null)
        setCustomPlaylist(playlist.id)
      }
    }
  }

  useEffect(() => {
    setPlaylist(playlists[0] && playlists[0].uri)
  }, [playlists, setPlaylist])

  const selectedPlaylist = playlists.find((p) => p.uri === playlist)

  return (
    <Grid
      container
      direction={mobile ? 'row' : 'column'}
      alignItems="stretch"
      spacing={1}
    >
      <Grid item>
        <Button onClick={showFip}>FIP</Button>
      </Grid>
      <Grid item>
        {selectedPlaylist && (
          <Autocomplete
            value={selectedPlaylist}
            onChange={(_, p) => onPlaylistClick(p)}
            autoHighlight
            options={playlists}
            getOptionLabel={(option) => option.name}
            style={{ width: mobile && 300 }}
            size="small"
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
      {!mobile && (
        <Grid item>
          <PlaylistsList
            playlists={[...customPlaylists, ...playlists]}
            onPlaylistClick={onPlaylistClick}
          />
        </Grid>
      )}
    </Grid>
  )
}
