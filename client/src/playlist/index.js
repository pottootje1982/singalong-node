import React, { useEffect, useState } from 'react'
import server, { setToken, get, post } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import orange from '@material-ui/core/colors/orange'
import {
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
import { Button } from '../Styled'

const sleepTime = 3000

export default function Playlist({
  playlist,
  token,
  user,
  setTrack,
  track,
  trackId,
  tracks,
  setTracks,
}) {
  const [offset, setOffset] = useState()
  const [trackToDownload, setTrackToDownload] = useState()
  const [tracksToDownload, setTracksToDownload] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)

  setToken(token)

  useEffect(selectTrack, [trackId])

  useEffect(refreshPlaylist, [playlist])
  useEffect(addTracks, [offset])

  function selectTrack() {
    const cpTrack = tracks.find((t) => t.id === trackId)
    setTrack(cpTrack)
  }

  function refreshPlaylist() {
    setTracks([])
    if (playlist) {
      setOffset(0)
    }
  }

  function addTracks() {
    if (user && playlist && !isNaN(offset)) {
      const offsetQuery = `?offset=${offset}`

      get(`v2/playlists/${playlist}${offsetQuery}`)
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks)
          if (offset === 0) {
            setTrack(newTracks[0])
          }
          setOffset(hasMore ? newTracks.length : null)
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
    server.put(`v2/player/play`, { ids, context_uri, offset: { id, position } })
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
    console.log('Downloading ', toDownload)
    console.log('Sleeping ', trackToDownload ? sleepTime : 0)
    sleep(trackToDownload ? sleepTime : 0).then(() => {
      if (!isDownloading) return
      setTrackToDownload(toDownload)
      const tail = tracksToDownload.slice(1)
      setTrack(toDownload)
      post('v2/lyrics/download', {
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

  function minimizeTitle() {
    for (const track of tracks) {
      track.title = getMinimalTitle(track.title)
      setTracks([...tracks])
    }
  }

  return (
    <Grid container>
      <Grid item>
        <ToggleButton
          value="check"
          selected={isDownloading}
          onClick={() => setIsDownloading(!isDownloading)}
        >
          <DownloadIcon />
        </ToggleButton>
        <Button
          onClick={() => {
            minimizeTitle()
          }}
        >
          Minimize
        </Button>
      </Grid>
      <Grid item>
        <List style={{ maxHeight: '50vh', overflow: 'auto' }} dense>
          {tracks.map((t, index) => (
            <ListItem
              button
              key={index}
              selected={t === track}
              onClick={() => setTrack(t)}
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
                  primary={`${t.artist} - ${t.title}`}
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
