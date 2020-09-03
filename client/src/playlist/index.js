import React, { useEffect, useState } from 'react'
import server, { setToken, get, post } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  ListItem,
  ListItemText,
  List,
  Grid,
} from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'
import DownloadIcon from '@material-ui/icons/GetApp'
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
  const [trackToDownload, setTrackToDownload] = useState()
  const [tracksToDownload, setTracksToDownload] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTitleMinimal, setIsTitleMinimal] = useState(false)
  const [isNotDownloaded, setIsNotDownloaded] = useState(false)
  const [hideArtist, setHideArtist] = useState(false)

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
      if (playlist === 'FIP') showCurrentlyOnFip()
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
    if (user && playlist && !isNaN(offset)) {
      get(`playlists/${playlist}`, { params: { offset } })
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0) return
          newTracks = [...rawTracks, ...newTracks]
          setRawTracks(newTracks)
          if (offset === 0 && newTracks[0]) setTrackId(newTracks[0].id)
          setOffset(hasMore ? newTracks.length : undefined)
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
      setTrackToDownload(null)
      setTracksToDownload([])
      return
    }
    setTracksToDownload(tracks.filter((track) => !track.lyrics))
  }

  useEffect(downloadTrack, [tracksToDownload])

  function downloadTrack() {
    const toDownload = tracksToDownload[0]
    if (!toDownload) return
    sleep(trackToDownload ? sleepTime : 0).then(() => {
      if (!isDownloading) return
      setTrackToDownload(toDownload)
      const tail = tracksToDownload.slice(1)
      setTrack(toDownload)
      post('lyrics/download', {
        track: trackToDownload,
        sleepTime,
      }).then(async ({ data: { lyrics } }) => {
        toDownload.lyrics = lyrics
        if (!isDownloading) return
        setTracks([...tracks])
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

  return (
    <Grid container>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={isTitleMinimal}
                onClick={() => {
                  setIsTitleMinimal(!isTitleMinimal)
                }}
              />
            }
            label="Minimize title"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={isNotDownloaded}
                onClick={() => {
                  setIsNotDownloaded(!isNotDownloaded)
                }}
              />
            }
            label="Not downloaded"
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideArtist}
                onClick={() => {
                  setHideArtist(!hideArtist)
                }}
              />
            }
            label="Hide artist"
          />
        </Grid>
      </Grid>
      <Grid item>
        <List
          style={{ maxHeight: '48vh', overflow: 'auto', width: '50vw' }}
          dense
        >
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
                  <PlayIcon></PlayIcon>
                </IconButton>
                <ListItemText
                  primary={t.artist ? `${t.artist} - ${t.title}` : t.title}
                  style={{
                    color:
                      t === trackToDownload
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
