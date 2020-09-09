import React, { useEffect, useState } from 'react'
import server, { setToken, get, post } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import {
  Menu,
  IconButton,
  ListItem,
  ListItemText,
  List,
  Grid,
  TextField,
} from '@material-ui/core'
import CheckMenuItem from '../CheckMenuItem'
import {
  PlayArrow,
  PlaylistAdd,
  GetApp as DownloadIcon,
  Menu as MenuIcon,
} from '@material-ui/icons'
import ToggleButton from '@material-ui/lab/ToggleButton'
import isEquivalent from '../isEquivalent'
import { Track } from '../track'
import Autocomplete from '@material-ui/lab/Autocomplete'

const sleepTime = 3000

export default function Playlist({
  playlist,
  radio,
  token,
  user,
  setTrack,
  track,
  trackId,
  setTrackId,
  trackFilters,
  setTrackFilters,
}) {
  const [offset, setOffset] = useState()
  const [tracks, setTracks] = useState([])
  const [trackIdToDownload, setTrackIdToDownload] = useState()
  const [tracksToDownload, setTracksToDownload] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [anchorEl, setAnchorEl] = useState()

  setToken(token)
  useEffect(selectTrack, [trackId])
  useEffect(showPlaylist, [playlist])
  useEffect(showCurrentlyOnFip, [radio])
  useEffect(addTracks, [offset])
  useEffect(refreshPlaylist, [track])

  function refreshPlaylist() {
    if (track && track.id) {
      const foundTrack = tracks.find((t) => t.id === track.id)
      if (foundTrack) {
        if (!isEquivalent(track, foundTrack)) {
          foundTrack.lyrics = track.lyrics
          setTracks([...tracks])
        }
      }
    }
  }

  function selectTrack() {
    const trackToSelect = tracks.find((t) => t.id === trackId)
    setTrack(trackToSelect || tracks[0])
  }

  function showPlaylist() {
    if (playlist) {
      setOffset(0)
    }
  }

  function showCurrentlyOnFip() {
    if (radio) {
      get('/radio/fip').then(({ data: { tracks, position } }) => {
        setTracks(tracks.map(Track.copy))
        setTrackId(tracks[position].id)
        post('/spotify/search', { tracks }).then(
          ({ data: { tracks: foundTracks } }) => {
            setTracks(foundTracks.map(Track.copy))
          }
        )
      })
    }
  }

  function addTracks() {
    if (offset === -1) {
      // end of playlist
      selectTrack()
    } else if (user && playlist && offset >= 0) {
      get(`playlists/${playlist}`, { params: { offset } })
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks.map(Track.copy))
          if (!trackId && offset === 0 && newTracks[0])
            setTrackId(newTracks[0].id)
          setOffset(hasMore ? newTracks.length : -1)
        })
        .catch((err) => console.log(err))
    }
  }

  function playTrack(uri) {
    let uris, context_uri, position
    const playArtist = playlist.includes('artist')
    if (playArtist || radio) {
      uris = tracks.map((t) => t.uri).filter((uri) => uri)
      position = uris.indexOf(uri)
      uri = undefined
    } else {
      context_uri = playlist
    }
    server.put(`/player/play`, {
      uris,
      context_uri,
      offset: { position, uri },
    })
  }

  function addTrackToPlaylist(uri) {
    console.log(uri, playlist)
    server.post(`/playlists/${playlist}/tracks`, { uris: [uri] })
  }

  useEffect(downloadTracks, [isDownloading])

  function downloadTracks() {
    if (!isDownloading) {
      setTrackIdToDownload(null)
      setTracksToDownload([])
      return
    }
    setTracksToDownload(tracks.filter((track) => !track.lyrics))
  }

  useEffect(downloadTrack, [tracksToDownload])

  function isCancelled() {
    if (!isDownloading) {
      setTrackIdToDownload(null)
    }
    return !isDownloading
  }

  function downloadTrack() {
    const toDownload = tracksToDownload[0]
    if (!toDownload) return
    setTrackIdToDownload(toDownload.id)
    sleep(trackIdToDownload ? sleepTime : 0).then(() => {
      if (isCancelled()) return
      const tail = tracksToDownload.slice(1)
      post('lyrics/download', {
        track: toDownload,
        sleepTime,
      }).then(({ data: { lyrics } }) => {
        if (lyrics) {
          setTrack(Track.copy({ ...toDownload, lyrics }))
        }
        if (isCancelled()) return
        if (isDownloading && tail.length > 0) setTracksToDownload(tail)
        else setTrackIdToDownload(null)
      })
    })
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function closeMenu() {
    setAnchorEl(null)
  }

  function selectTrackId(track) {
    if (track) setTrackId(track.id)
  }

  return (
    <Grid container alignItems="stretch">
      <Grid container item spacing={1} alignItems="center">
        <Grid item>
          <ToggleButton
            value="check"
            selected={isDownloading}
            onClick={() => setIsDownloading(!isDownloading)}
            style={{ width: 30, height: 30 }}
          >
            <DownloadIcon />
          </ToggleButton>
        </Grid>

        <Grid item>
          <IconButton
            size="small"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            label="label"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            getContentAnchorEl={null}
            anchorEl={anchorEl}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            open={!!anchorEl}
            onClose={closeMenu}
          >
            <CheckMenuItem
              setter={setTrackFilters}
              state={trackFilters}
              filterKey="minimalTitle"
              name="Minimize title"
              close={closeMenu}
            />
            <CheckMenuItem
              setter={setTrackFilters}
              state={trackFilters}
              filterKey="isNotDownloaded"
              name="Not downloaded"
              close={closeMenu}
            />
            <CheckMenuItem
              setter={setTrackFilters}
              state={trackFilters}
              filterKey="hideArtist"
              name="Hide artist"
              close={closeMenu}
            />
          </Menu>
        </Grid>
        <Grid item>
          {track && trackId && (
            <Autocomplete
              fullWidth
              value={track}
              onChange={(_, t) => selectTrackId(t)}
              autoHighlight
              options={tracks}
              getOptionLabel={(t) => t.toString(trackFilters)}
              getOptionSelected={(option, value) => option.id === trackId}
              style={{ width: 300 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select track:"
                  variant="outlined"
                />
              )}
            />
          )}
        </Grid>
      </Grid>

      <Grid item>
        <List style={{ maxHeight: '48vh', overflow: 'auto' }} dense>
          {tracks
            .filter((t) => !trackFilters.isNotDownloaded || !t.lyrics)
            .map((t, index) => (
              <ListItem
                button
                key={index}
                selected={t.id === trackId}
                autoFocus={t.id === trackId}
                onClick={() => selectTrackId(t)}
              >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  {t.uri && (
                    <IconButton
                      size="small"
                      style={{ width: 25, height: 25 }}
                      onClick={() => playTrack(t.uri)}
                    >
                      <PlayArrow></PlayArrow>
                    </IconButton>
                  )}
                  {t.uri && radio && (
                    <IconButton
                      size="small"
                      style={{ width: 25, height: 25 }}
                      onClick={() => addTrackToPlaylist(t.uri)}
                    >
                      <PlaylistAdd></PlaylistAdd>
                    </IconButton>
                  )}
                  <ListItemText
                    primary={t.toString(trackFilters)}
                    style={{
                      color:
                        t.id === trackIdToDownload && t.id
                          ? orange[500]
                          : t.lyrics
                          ? green[500]
                          : red[500],
                    }}
                  />
                </div>
              </ListItem>
            ))}
        </List>
      </Grid>
    </Grid>
  )
}
