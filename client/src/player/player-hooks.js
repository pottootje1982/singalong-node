import { useCallback, useContext } from 'react'
import ServerContext from '../server-context'
import PlayerContext from './player-context'
import PlaylistContext from '../playlist/playlist-context'
import { Track } from '../track'
import { useNavigate } from 'react-router-dom'

export default function usePlayTrack() {
  const { spotifyAxios } = useContext(ServerContext)
  const { playlist, radio, tracks } = useContext(PlaylistContext)
  const {
    setIsPlaying,
    device,
    setMonitorCurrentlyPlaying,
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
    const position_ms = playPosition || 0

    return spotifyAxios()
      .put(`/me/player/play?device_id=${device}`, {
        uris,
        context_uri,
        offset: { position, uri },
        position_ms,
      })
      .then(() => {
        setMonitorCurrentlyPlaying(true)
      })
  }
}

export function useUpdatePlayingTrack() {
  const { server, spotifyAxios } = useContext(ServerContext)
  const { setTrackId, tracks, setTracks, tracksInitialized } = useContext(PlaylistContext)
  const {
    setIsPlaying,
    monitorCurrentlyPlaying,
  } = useContext(PlayerContext)

  let navigate = useNavigate()
  
  const navigateToPlaylist = useCallback((uri) => {
    navigate(`/currently-playing/${uri}`)
  }, [navigate])

  const setPlaylistFromContext = useCallback((uri, item) => {
    if (uri.includes(':artist:')) {
      server().get(`/api/playlists/${uri}`).then(({ data }) => {
        let { tracks: artistTracks } = data || {}
        artistTracks = artistTracks || []
        const found = artistTracks.find((t) => t.uri === item.uri)
        if (found) navigateToPlaylist(uri)
        else navigateToPlaylist(item.album.uri)
      })
    } else {
      navigateToPlaylist(uri)
    }
  }, [navigateToPlaylist, server])

  const callback = useCallback(() => {
    return spotifyAxios().get(`/me/player/currently-playing`).then(({ data }) => {
      const { is_playing, progress_ms, item, context } = data || {}
      if (item) {
        const { id, uri: trackUri } = item
        const found = tracksInitialized || tracks.find((t) => trackUri === t.uri)
        const { uri } = context || {}
        if (monitorCurrentlyPlaying && id && !found && is_playing) {
          if (uri) setPlaylistFromContext(uri, item)
          else setTracks([Track.fromSpotify(item)])
        }
        if (monitorCurrentlyPlaying && id) {
          setTrackId(id)
        }
        setIsPlaying(is_playing)
        return { uri, is_playing, progress: progress_ms / 1000, duration: item && (item.duration_ms / 1000) }
      }
      return {}
    })
  }, [monitorCurrentlyPlaying, setIsPlaying, setPlaylistFromContext, setTrackId, setTracks, spotifyAxios, tracks, tracksInitialized])
  return callback
}
