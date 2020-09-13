import { useContext } from 'react'
import server from '../server'
import PlayerContext from './player-context'

export default function usePlayTrack({ playlist, radio, tracks, device }) {
  const { setIsPlaying } = useContext(PlayerContext)

  return (uri, playPosition) => {
    let uris, context_uri, position
    const playArtist = playlist.includes('artist')
    if (playArtist || radio) {
      uris = tracks.map((t) => t.uri).filter((uri) => uri)
      position = uris.indexOf(uri)
      uri = undefined
    } else {
      context_uri = playlist
    }
    setIsPlaying(true)
    server.put(`/player/play`, {
      deviceId: device && device.id,
      uris,
      context_uri,
      offset: { position, uri },
      position_ms: playPosition || 0,
    })
  }
}
