import React, { useEffect, useState } from 'react'
import server, { setToken, get } from '../server'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import { IconButton, ListItem, ListItemText, List } from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'

export default function Playlist({
  playlist,
  token,
  user,
  setTrack,
  track,
  trackId,
}) {
  const [offset, setOffset] = useState()
  const [tracks, setTracks] = useState([])

  setToken(token)

  useEffect(getPlaylist, [offset])

  useEffect(() => {
    const cpTrack = tracks.find((t) => t.id === trackId)
    setTrack(cpTrack)
  }, [trackId, tracks, setTrack])

  function getPlaylist() {
    if (user && playlist) {
      const offsetQuery = offset ? `?offset=${offset}` : ''

      get(`v2/playlists/${playlist}${offsetQuery}`)
        .then(({ data: { tracks: newTracks, hasMore } }) => {
          if (!newTracks || newTracks.length === 0) return
          newTracks = [...tracks, ...newTracks]
          setTracks(newTracks)
          if (hasMore) {
            setOffset(newTracks.length)
          }
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

  return (
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
              style={{ color: t.lyrics ? green[500] : red[500] }}
            />
          </div>
        </ListItem>
      ))}
    </List>
  )
}
