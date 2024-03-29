import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react'
import { TextField, useMediaQuery, Autocomplete, Stack } from '@mui/material'
import ServerContext from '../server-context'
import LibraryList from './library-list'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import { useNavigate } from 'react-router-dom'
import PlayerContext from '../player/player-context'

export default function Library() {
  const { server } = useContext(ServerContext)
  const [offset, setOffset] = useState()
  const [allPlaylists, setAllPlaylists] = useState([])
  const searchRef = useRef(null)
  const mobile = !useMediaQuery('(min-width:600px)')

  const { isPlaying } = useContext(PlayerContext)
  const { playlist, radio, customPlaylist } = useContext(PlaylistContext)
  const {
    playlists,
    setPlaylists,
    customPlaylists,
    setCustomPlaylists,
  } = useContext(LibraryContext)
  let navigate = useNavigate()

  function init() {
    setOffset(0)
    server().get('/api/playlists/custom').then(({ data }) => {
      const { playlists } = data || {}
      if (playlists) setCustomPlaylists(playlists)
    })
  }

  const navigateToPlaylist = useCallback((uri) => {
    navigate(`/playlist/${uri}`)
  }, [navigate])

  function selectFirstPlaylist() {
    if (
      !isPlaying &&
      !playlist &&
      !radio &&
      !customPlaylist &&
      playlists.length
    ) {
      navigateToPlaylist(playlists[0].uri)
    }
  }

  useEffect(getPlaylists, [offset, playlists, server, setPlaylists])
  useEffect(init, [server, setCustomPlaylists])
  useEffect(selectFirstPlaylist, [playlists, isPlaying, customPlaylist, navigateToPlaylist, playlist, radio])

  const comparePlaylists = (a, b) => a.favourite && b.favourite ? 0 : a.favourite ? -1 : 0

  function getPlaylists() {
    if (offset === -1) {
      if (searchRef.current) searchRef.current.focus()
    } else if (offset >= 0) {
      server()
        .get('/api/playlists', { params: { offset, limit: 50 } })
        .then(({ data: { playlists: newPlaylists, hasMore } }) => {
          if (!newPlaylists) return
          const items = [...playlists, ...newPlaylists]
          items.sort(comparePlaylists)
          setPlaylists(items)
          setOffset(hasMore ? items.length : -1)
        })
    }
  }

  function onPlaylistClick(playlist) {
    if (playlist) {
      if (playlist.uri) {
        navigateToPlaylist(playlist.uri)
      } else if (playlist.id) {
        navigate(`/custom-playlist/${playlist.id}`)
      }
    }
  }

  useEffect(() => {
    setAllPlaylists([...customPlaylists, ...playlists])
  }, [playlists, customPlaylists])

  const selectedPlaylist = allPlaylists.find((p) => p.uri === playlist)

  return (
    <Stack
      direction={mobile ? 'row' : 'column'}
      alignItems="stretch"
      paddingTop={1}
      paddingLeft={1}
    >
      {selectedPlaylist && (
        <Autocomplete
          value={selectedPlaylist}
          onChange={(_, p) => onPlaylistClick(p)}
          autoHighlight
          options={allPlaylists}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option) =>
            selectedPlaylist
              ? option.uri === playlist
              : allPlaylists.indexOf(option) === 0
          }
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
      {!mobile && (
        <LibraryList
          playlists={allPlaylists}
          onPlaylistClick={onPlaylistClick}
        />
      )}
    </Stack>
  )
}
