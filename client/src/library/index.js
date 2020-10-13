import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createRef,
} from 'react'
import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import { Button } from '../Styled'
import Autocomplete from '@material-ui/lab/Autocomplete'
import ServerContext from '../server-context'
import LibraryList from './library-list'
import PlaylistContext from '../playlist/playlist-context'
import LibraryContext from './library-context'
import { useHistory } from 'react-router-dom'
import { useUpdatePlayingTrack } from '../player/player-hooks'

export default function Library() {
  const { server } = useContext(ServerContext)
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
  const audioRef = createRef()

  function init() {
    updateCurrentlyPlaying().then(({ uri, is_playing }) => {
      if (is_playing) setCurrentlyPlaying(uri)
    })

    setOffset(0)
    getCustomPlaylists()
  }

  function getCustomPlaylists() {
    server.get('/api/playlists/custom').then(({ data }) => {
      const { playlists } = data || {}
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
      if (searchRef.current) searchRef.current.focus()
    } else if (offset >= 0) {
      server
        .get('/api/playlists', { params: { offset, limit: 50 } })
        .then(({ data: { playlists: newPlaylists, hasMore } }) => {
          if (!newPlaylists) return
          const items = [...playlists, ...newPlaylists]
          setPlaylists(items)
          setOffset(hasMore ? items.length : -1)
        })
    }
  }

  function showFip() {
    audioRef.current.play()
    history.push('/radio/fip')
  }

  function onPlaylistClick(playlist) {
    if (playlist) {
      audioRef.current.pause()
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
        <Button onClick={showFip}>FIP</Button>
        <audio
          ref={audioRef}
          src="https://direct.fipradio.fr/live/fip-midfi.mp3"
        ></audio>
      </Grid>
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
