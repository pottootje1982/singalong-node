import React, { useEffect, useContext } from "react";
import { IconButton } from "@mui/material";
import { Stack } from "@mui/material";
import { Fullscreen, FullscreenExit } from "@mui/icons-material";

import LyricsMenu from "./lyrics-menu";
import PlaylistContext from "../playlist/playlist-context";
import Player from "../player";

export default function LyricsToolbar({
  lyricsFullscreen,
  setLyricsFullscreen,
  trackFilters,
  setLyrics,
  lyricsRef,
}) {
  const { track } = useContext(PlaylistContext);

  useEffect(() => {
    if (track) setLyrics(track.lyrics);
  }, [track, setLyrics]);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        size="small"
        onClick={() => {
          setLyricsFullscreen(!lyricsFullscreen);
        }}
      >
        {lyricsFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
      <LyricsMenu lyricsRef={lyricsRef} trackFilters={trackFilters} />
      <Player />
    </Stack>
  );
}
