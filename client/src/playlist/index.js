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
} from '@material-ui/core'
import CheckMenuItem from '../CheckMenuItem'
import {
  PlayArrow,
  GetApp as DownloadIcon,
  Menu as MenuIcon,
} from '@material-ui/icons'
import ToggleButton from '@material-ui/lab/ToggleButton'
import { getMinimalTitle } from '../track_helpers'

const sleepTime = 3000

export default function Playlist({
  playlist,
  token,
  user,
  setTrack,
  track,
  trackId,
  setTrackId,
}) {
  const [offset, setOffset] = useState()
  const [tracks, setTracks] = useState([])
  const [rawTracks, setRawTracks] = useState([])
  const [trackIdToDownload, setTrackIdToDownload] = useState()
  const [tracksToDownload, setTracksToDownload] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTitleMinimal, setIsTitleMinimal] = useState(true)
  const [isNotDownloaded, setIsNotDownloaded] = useState(false)
  const [hideArtist, setHideArtist] = useState(false)
  const [anchorEl, setAnchorEl] = useState()

  setToken(token)
  useEffect(selectTrack, [trackId])
  useEffect(showPlaylist, [playlist])
  useEffect(addTracks, [offset])
  useEffect(refreshPlaylist, [track])

  function refreshPlaylist() {
    if (track && track.id) {
      const rawTrack = rawTracks.find((t) => t.id === track.id)
      if (rawTrack) {
        if (!Object.is(track, rawTrack)) {
          rawTrack.lyrics = track.lyrics
          setRawTracks([...rawTracks])
        }
      }
    }
  }

  function selectTrack() {
    const cpTrack = tracks.find((t) => t.id === trackId)
    setTrack(cpTrack || tracks[0])
  }

  function showPlaylist() {
    if (playlist) {
      if (playlist.startsWith('FIP_')) showCurrentlyOnFip()
      else setOffset(0)
    }
  }

  function showCurrentlyOnFip() {
    get('/radio/fip').then(({ data: { tracks, position } }) => {
      setRawTracks(tracks)
      setTrackId(tracks[position].id)
    })
  }

  function addTracks() {
    if (offset === -1) {
      // end of playlist
      selectTrack()
    } else if (user && playlist && offset >= 0) {
      get(`playlists/${playlist}`, { params: { offset } })
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0) return
          newTracks = [...rawTracks, ...newTracks]
          setRawTracks(newTracks)
          if (!trackId && offset === 0 && newTracks[0])
            setTrackId(newTracks[0].id)
          setOffset(hasMore ? newTracks.length : -1)
        })
        .catch((err) => console.log(err))
    }
  }

  function playTrack(id, position) {
    let ids, context_uri
    const playArtist = playlist.includes('artist')
    if (playArtist) {
      ids = tracks.map((t) => t.id)
      id = undefined
    } else {
      context_uri = playlist
      position = undefined
    }
    server.put(`player/play`, { ids, context_uri, offset: { id, position } })
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

  function downloadTrack() {
    const toDownload = tracksToDownload[0]
    if (!toDownload) return
    setTrackIdToDownload(toDownload.id)
    sleep(trackIdToDownload ? sleepTime : 0).then(() => {
      if (!isDownloading) return
      const tail = tracksToDownload.slice(1)
      post('lyrics/download', {
        track: toDownload,
        sleepTime,
      }).then(({ data: { lyrics } }) => {
        if (lyrics) {
          toDownload.lyrics = lyrics
          setTrackId(toDownload.id)
          setTrack({ ...toDownload })
        }
        if (!isDownloading) return
        if (isDownloading && tail.length > 0) setTracksToDownload(tail)
      })
    })
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  useEffect(minimizeTitle, [
    isTitleMinimal,
    isNotDownloaded,
    hideArtist,
    rawTracks,
  ])

  function minimizeTitle() {
    const minimizedTracks = rawTracks.map((track) => ({
      ...track,
      artist: hideArtist ? null : track.artist,
      title: isTitleMinimal ? getMinimalTitle(track.title) : track.title,
    }))
    setTracks(
      minimizedTracks.filter((track) =>
        isNotDownloaded ? !track.lyrics : true
      )
    )
  }

  function closeMenu() {
    setAnchorEl(null)
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
              setter={setIsTitleMinimal}
              checked={isTitleMinimal}
              name="Minimize title"
              close={closeMenu}
            />
            <CheckMenuItem
              setter={setIsNotDownloaded}
              checked={isNotDownloaded}
              name="Not downloaded"
              close={closeMenu}
            />
            <CheckMenuItem
              setter={setHideArtist}
              checked={hideArtist}
              name="Hide artist"
              close={closeMenu}
            />
          </Menu>
        </Grid>
      </Grid>
      <Grid item>
        <List style={{ maxHeight: '48vh', overflow: 'auto' }} dense>
          {tracks.map((t, index) => (
            <ListItem
              button
              key={index}
              selected={t.id === trackId}
              autoFocus={t.id === trackId}
              onClick={() => setTrackId(t.id)}
            >
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <IconButton
                  size="small"
                  style={{ width: 25, height: 25 }}
                  onClick={() => playTrack(t.id, index)}
                >
                  <PlayArrow></PlayArrow>
                </IconButton>
                <ListItemText
                  primary={t.artist ? `${t.artist} - ${t.title}` : t.title}
                  style={{
                    color:
                      t.id === trackIdToDownload
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
