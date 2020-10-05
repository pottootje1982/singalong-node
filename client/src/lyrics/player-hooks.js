import { useContext } from 'react'
import { get, spotifyAxios } from '../server'
import PlayerContext from './player-context'
import PlaylistContext from '../playlist/playlist-context'
import { Track } from '../track'

export default function usePlayTrack() {
  const { playlist, radio, tracks } = useContext(PlaylistContext)
  const {
    setIsPlaying,
    device,
    setMonitorCurrentlyPlaying,
    setPlayPosition,
  } = useContext(PlayerContext)

  return (uri, playPosition) => {
    let uris, context_uri, position
    const playArtist = playlist && playlist.includes('artist')
    if (playArtist || radio) {
      uris = tracks.map((t) => t.uri).filter((uri) => uri)
      position = uris.indexOf(uri)
      uri = undefined
    } else {
      context_uri = playlist
    }
    setIsPlaying(true)
    let id = device && device.id
    const position_ms = playPosition || 0
    setPlayPosition(position_ms)

    return spotifyAxios
      .put(`/me/player/play?device_id=${id}`, {
        uris,
        context_uri,
        offset: { position, uri },
        position_ms,
      })
      .then(() => {
        setPlayPosition(position_ms)
        setMonitorCurrentlyPlaying(true)
      })
  }
}

export function useUpdatePlayingTrack() {
  const { setPlaylist, setTrackId, tracks, setTracks } = useContext(
    PlaylistContext
  )
  const {
    setIsPlaying,
    setPlayPosition,
    setDuration,
    monitorCurrentlyPlaying,
    setLastUpdateTime,
    setLastPlayPosition,
  } = useContext(PlayerContext)

  function setPlaylistFromContext(uri, item) {
    console.log(uri)
    if (uri.includes(':artist:')) {
      get(`/playlists/${uri}`).then(({ data }) => {
        let { tracks: artistTracks } = data || {}
        artistTracks = artistTracks || []
        const found = artistTracks.find((t) => t.uri === item.uri)
        if (found) setPlaylist(uri)
        else setPlaylist(item.album.uri)
      })
    } else {
      setPlaylist(uri)
    }
  }

  return () => {
    return spotifyAxios.get(`/me/player/currently-playing`).then(({ data }) => {
      if (data) {
        const { is_playing, progress_ms, item, context } = data
        const { id, uri: trackUri } = item
        const found = tracks.find((t) => trackUri === t.uri)
        if (monitorCurrentlyPlaying && id && !found) {
          const { uri } = context || {}
          if (uri) setPlaylistFromContext(uri, item)
          else setTracks([Track.fromSpotify(item)])
          setTrackId(item.id)
        }
        setIsPlaying(is_playing)
        const playPosition = progress_ms / 1000
        setPlayPosition(playPosition)
        setLastUpdateTime(Date.now())
        setLastPlayPosition(playPosition)

        if (item) {
          setDuration(item.duration_ms / 1000)
        }
      }
    })
  }
}
