import React, { useEffect, useContext, useCallback } from "react";
import ServerContext from "../server-context";
import { Track } from "../track";
import Tracks from "./tracks";
import PlaylistContext from "../playlist/playlist-context";

export default function Playlist({ trackFilters, lyricsFullscreen }) {
  const { server } = useContext(ServerContext);
  const { setTrackId, radio, customPlaylist, setTracks, playlist } =
    useContext(PlaylistContext);

  const showAndSearchPlaylist = useCallback(
    (url) => {
      setTracks([]);
      return server()
        .get(url)
        .then(({ data }) => {
          const { tracks } = data || {};
          if (!tracks) return;
          setTracks(tracks.map(Track.copy));
          setTrackId(tracks[0].id);
          server()
            .post("/api/spotify/search", { tracks })
            .then(({ data: { tracks: foundTracks } }) => {
              setTracks((foundTracks || []).map(Track.copy));
            });
          return data;
        });
    },
    [setTracks, server, setTrackId]
  );

  useEffect(() => {
    if (customPlaylist) {
      showAndSearchPlaylist(`/api/playlists/${customPlaylist}/custom`);
    }
  }, [customPlaylist, showAndSearchPlaylist]);

  useEffect(() => {
    if (radio) {
      setTrackId();
      showAndSearchPlaylist("/api/radio/fip").then((data) => {
        const { position, tracks } = data || {};
        setTrackId(tracks[position].id);
      });
    }
  }, [radio, setTrackId, showAndSearchPlaylist]);

  function selectTrackId(track) {
    if (track) setTrackId(track.id);
  }

  return (
    <Tracks
      key={playlist}
      trackFilters={trackFilters}
      lyricsFullscreen={lyricsFullscreen}
      selectTrackId={selectTrackId}
    />
  );
}
