import { useContext } from 'react'
import { spotifyAxios } from '../server'
import PlayerContext from './player-context'
import PlaylistContext from '../playlist/playlist-context'
import { Track } from '../track'

export default function usePlayTrack() {
  const { playlist, radio, tracks } = useContext(PlaylistContext)
  const { setIsPlaying, device, setMonitorCurrentlyPlaying } = useContext(
    PlayerContext
  )

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

    return spotifyAxios
      .put(`/me/player/play?device_id=${id}`, {
        uris,
        context_uri,
        offset: { position, uri },
        position_ms: playPosition || 0,
      })
      .then(() => {
        setMonitorCurrentlyPlaying(true)
      })
  }
}

export function useUpdatePlayingTrack() {
  const { setPlaylist, setTrackId, setTracks, radio } = useContext(
    PlaylistContext
  )
  const {
    setIsPlaying,
    setPlayPosition,
    setDuration,
    monitorCurrentlyPlaying,
  } = useContext(PlayerContext)

  return () => {
    spotifyAxios.get(`/me/player/currently-playing`).then(({ data }) => {
      if (data) {
        const { is_playing, progress_ms, item, context } = data
        if (monitorCurrentlyPlaying && item && !radio) {
          const { uri } = context || {}
          if (uri) setPlaylist(context.uri)
          else setTracks([Track.fromSpotify(item)])
          setTrackId(item.id)
        }
        setIsPlaying(is_playing)
        setPlayPosition(progress_ms / 1000)
        if (item) {
          setDuration(item.duration_ms / 1000)
        }
      }
    })
  }
}
