import server from '../server'

export default function usePlayTrack({ playlist, radio, tracks, device }) {
  return (uri) => {
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
      deviceId: device && device.id,
      uris,
      context_uri,
      offset: { position, uri },
    })
  }
}
