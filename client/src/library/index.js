import React, { useEffect, useState, useRef, useContext } from 'react'
import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { get } from '../server'
import LibraryList from './library-list'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import { useHistory } from 'react-router-dom'
import { useUpdatePlayingTrack } from '../lyrics/player-hooks'

export default function Library() {
  const [offset, setOffset] = useState()
  const [allPlaylists, setAllPlaylists] = useState([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState()
  const searchRef = useRef(null)
  const mobile = !useMediaQuery('(min-width:600px)')
  const { playlist, radio, customPlaylist } = useContext(PlaylistContext)
  const {
    playlists,
    setPlaylists,
    customPlaylists,
    setCustomPlaylists,
  } = useContext(LibraryContext)
  const history = useHistory()
  const updateCurrentlyPlaying = useUpdatePlayingTrack(navigateToPlaylist)

  function init() {
    updateCurrentlyPlaying().then(({ uri, is_playing }) => {
      if (is_playing) setCurrentlyPlaying(uri)
    })

    setOffset(0)
    getCustomPlaylists()
  }

  function getCustomPlaylists() {
    get('playlists/custom').then(({ data: { playlists } }) => {
      if (playlists) setCustomPlaylists(playlists)
    })
  }

  function selectFirstPlaylist() {
    if (
      !currentlyPlaying &&
      !playlist &&
      !radio &&
      !customPlaylist &&
      playlists.length
    ) {
      navigateToPlaylist(playlists[0].uri)
    }
  }

  useEffect(getPlaylists, [offset])
  useEffect(init, [])
  useEffect(selectFirstPlaylist, [playlists, currentlyPlaying])

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
    history.push('/radio/fip')
  }

  function onPlaylistClick(playlist) {
    if (playlist) {
      if (playlist.uri) {
        navigateToPlaylist(playlist.uri)
      } else if (playlist.id) {
        history.push(`/custom-playlist/${playlist.id}`)
      }
    }
  }

  useEffect(() => {
    setAllPlaylists([...customPlaylists, ...playlists])
  }, [playlists, customPlaylists])

  function navigateToPlaylist(uri) {
    history.push(`/playlist/${uri}`)
  }

  const selectedPlaylist =
    playlists.find((p) => p.uri === playlist) || playlists[0]

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
            options={selectedPlaylist ? allPlaylists : []}
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
          <LibraryList
            playlists={allPlaylists}
            onPlaylistClick={onPlaylistClick}
          />
        </Grid>
      )}
    </Grid>
  )
}