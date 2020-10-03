import React, { useEffect, useState, useRef, useContext } from 'react'
import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { get } from '../server'
import LibraryList from './library-list'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import PlayerContext from '../lyrics/player-context'
import { useHistory } from 'react-router-dom'

export default function Library({ getFreshToken }) {
  const [offset, setOffset] = useState()
  const [allPlaylists, setAllPlaylists] = useState([])
  const searchRef = useRef(null)
  const mobile = !useMediaQuery('(min-width:600px)')
  const {
    setTrackId,
    playlist,
    setPlaylist,
    radio,
    setRadio,
    setCustomPlaylist,
  } = useContext(PlaylistContext)
  const {
    playlists,
    setPlaylists,
    customPlaylists,
    setCustomPlaylists,
  } = useContext(LibraryContext)
  const {
    monitorCurrentlyPlaying,
    setMonitorCurrentlyPlaying,
    player,
    isPlaying,
  } = useContext(PlayerContext)
  const history = useHistory()

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
    history.push('/radio/fip')
  }

  function onPlaylistClick(playlist) {
    if (playlist) {
      setMonitorCurrentlyPlaying(false)
      setTrackId(null)
      setRadio(null)
      if (playlist.uri) {
        setCustomPlaylist(null)
        setPlaylist(playlist.uri)
      } else if (playlist.id) {
        setPlaylist(null)
        setCustomPlaylist(playlist.id)
      }
      history.push(`/playlist/${playlist.uri}`)
    }
  }

  function selectFirstPlaylist() {
    if (player && !(isPlaying && monitorCurrentlyPlaying) && !radio) {
      const firstPlaylist = playlists[0] && playlists[0].uri
      setPlaylist(playlist || firstPlaylist)
    } else if (radio) {
      setRadio(radio)
    }
  }

  useEffect(selectFirstPlaylist, [playlists, setPlaylist, player])

  useEffect(() => {
    setAllPlaylists([...customPlaylists, ...playlists])
  }, [playlists, customPlaylists])

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
