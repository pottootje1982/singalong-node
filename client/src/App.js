import React, { useState } from 'react';
import Library from './library';
import Playlist from './playlist';
import Lyrics from './lyrics';
import { Stack, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { PlaylistProvider } from './playlist/playlist-context';
import { DownloadProvider } from './lyrics/download-context';
import { PlayerProvider } from './player/player-context';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

function App() {
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false);
  const mobile = !useMediaQuery('(min-width:600px)');

  const [trackFilters, setTrackFilters] = useState({
    minimalTitle: true,
    isNotDownloaded: false,
    hideArtist: false,
  });

  return (
    <>
      <PlaylistProvider>
        <DownloadProvider>
          <PlayerProvider>
            <CssBaseline />
            <PanelGroup direction="horizontal" autoSaveId="playlist-pane">
              {!(mobile || lyricsFullscreen) && (
                <>
                  <Panel defaultSize={20}>
                    <Library />
                  </Panel>
                  <PanelResizeHandle
                    style={{ minWidth: 5, backgroundColor: 'lightgray' }}
                  />
                </>
              )}
              <Panel>
                <Stack
                  spacing={1}
                  direction={lyricsFullscreen ? 'column-reverse' : 'column'}
                  justifyContent={lyricsFullscreen ? 'flex-end' : 'flex-start'}
                >
                  <Lyrics
                    id="lyrics"
                    lyricsFullscreen={lyricsFullscreen}
                    setLyricsFullscreen={setLyricsFullscreen}
                    trackFilters={trackFilters}
                    setTrackFilters={setTrackFilters}
                  ></Lyrics>
                  <Playlist
                    lyricsFullscreen={lyricsFullscreen}
                    trackFilters={trackFilters}
                    setTrackFilters={setTrackFilters}
                  ></Playlist>
                </Stack>
              </Panel>
            </PanelGroup>
          </PlayerProvider>
        </DownloadProvider>
      </PlaylistProvider>
    </>
  );
}

export default App;
