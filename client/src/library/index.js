import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react'
import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import ServerContext from '../server-context'
import LibraryList from './library-list'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import { useHistory } from 'react-router-dom'
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
  const history = useHistory()

  function init() {
    setOffset(0)
    getCustomPlaylists()
  }

  function getCustomPlaylists() {
    server().get('/api/playlists/custom').then(({ data }) => {
      const { playlists } = data || {}
      if (playlists) setCustomPlaylists(playlists)
    })
  }

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

  useEffect(getPlaylists, [offset])
  useEffect(init, [])
  useEffect(selectFirstPlaylist, [playlists, isPlaying])

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

  const selectedPlaylist = allPlaylists.find((p) => p.uri === playlist)

  return (
    <Grid
      container
      direction={mobile ? 'row' : 'column'}
      alignItems="stretch"
      spacing={1}
    >
      <Grid item>
        {selectedPlaylist && (
          <Autocomplete
            value={selectedPlaylist}
            onChange={(_, p) => onPlaylistClick(p)}
            autoHighlight
            options={allPlaylists}
            getOptionLabel={(option) => option.name}
            getOptionSelected={(option) =>
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
