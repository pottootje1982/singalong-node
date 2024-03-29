import React, {
  useContext,
  useEffect,
  useState,
  createRef,
  useCallback,
} from 'react';
import { IconButton } from '@mui/material';
import { Slider, Typography } from '@mui/material';
import { SkipPrevious, SkipNext, PlayArrow, Pause } from '@mui/icons-material';

import ServerContext from '../server-context';
import usePlayTrack, { useUpdatePlayingTrack } from './player-hooks';
import PlayerContext from './player-context';
import PlaylistContext from '../playlist/playlist-context';
import WebPlayer from './web-player';
import { useNavigate } from 'react-router-dom';
let updateInterval;

export default function Player() {
  const { spotifyAxios } = useContext(ServerContext);
  const { track, setTrackId, radio, tracks } = useContext(PlaylistContext);
  const {
    device,
    isPlaying,
    setIsPlaying,
    monitorCurrentlyPlaying,
    setMonitorCurrentlyPlaying,
    playerState,
    setPlayerState,
  } = useContext(PlayerContext);

  const [playPosition, setPlayPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestamp, setTimestamp] = useState();
  const playTrack = usePlayTrack();
  const updateCurrentlyPlaying = useUpdatePlayingTrack();
  let navigate = useNavigate();
  const audioRef = createRef();
  const [seeking, setSeeking] = useState(false);

  const update = useCallback(() => {
    if (!playerState?.paused) {
      return updateCurrentlyPlaying();
    }
  }, [playerState?.paused, updateCurrentlyPlaying]);

  function updatePlayingPosition() {
    if (!seeking && !playerState?.paused) {
      update().then(({ progress, duration }) => {
        setPlayPosition(progress);
        if (duration) setDuration(duration);
      });
    }
  }

  useEffect(updatePlayingPosition, [
    timestamp,
    playerState?.paused,
    seeking,
    update,
  ]);

  function updateTimestamp() {
    setTimestamp(Date.now());
  }

  function isPlayingChanged() {
    if (isPlaying) updateInterval = setInterval(updateTimestamp, 1000);
    else clearInterval(updateInterval);
  }

  useEffect(isPlayingChanged, [isPlaying]);

  function deviceUpdated() {
    if (device) update();
  }

  function monitorUpdated() {
    if (monitorCurrentlyPlaying) updateCurrentlyPlaying();
  }

  useEffect(monitorUpdated, [monitorCurrentlyPlaying, updateCurrentlyPlaying]);
  useEffect(deviceUpdated, [device, updateCurrentlyPlaying, update]);

  async function onPlayPositionClick(_, value) {
    setPlayPosition(value);
    setSeeking(true);
    await spotifyAxios().put(`me/player/seek?position_ms=${value * 1000}`);
    await update();
    setSeeking(false);
    setPlayPosition(value);
  }

  async function togglePlay() {
    if (radio) {
      audioRef.current[isPlaying ? 'pause' : 'play']();
      setIsPlaying(!isPlaying);
      return;
    }

    setSeeking(true);
    if (isPlaying === undefined) {
      await playTrack(track.uri, 0);
    } else {
      await spotifyAxios().put(`/me/player/${isPlaying ? 'pause' : 'play'}`);
    }
    await update();
    setSeeking(false);
    setIsPlaying(!isPlaying);
    setMonitorCurrentlyPlaying(true);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function spotifyCommand(command) {
    setSeeking(true);
    await spotifyAxios().post(`/me/player/${command}`);
    setSeeking(false);
    await update();
    await sleep(1000);
    // repeat to make sure new track is displayed
    update();
  }

  function pad(num, size) {
    var s = Math.floor(num) + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  function valuetext(value) {
    value = value || 0;
    const minutes = value / 60;
    return `${pad(minutes, 2)}:${pad(value % 60, 2)}`;
  }

  const navigateToPlaylist = useCallback(
    (uri) => {
      navigate(`/currently-playing/${uri}`);
    },
    [navigate]
  );

  function updatePlayerState() {
    if (playerState) {
      const {
        position,
        duration,
        context,
        track_window: { current_track },
      } = playerState;
      setPlayPosition(position / 1000);
      setDuration(duration / 1000);
      const { linked_from_uri, uri, linked_from, id } = current_track || {};
      const uriPlaying = linked_from_uri || uri;
      const trackPlaying = tracks.find((t) => t.uri === uriPlaying);
      const idToSelect = linked_from.id || id;
      if (monitorCurrentlyPlaying && !trackPlaying) {
        navigateToPlaylist(context.uri);
        setTrackId(idToSelect);
      }
    }
  }

  useEffect(updatePlayerState, [
    playerState,
    navigateToPlaylist,
    monitorCurrentlyPlaying,
    setTrackId,
    tracks,
  ]);

  return (
    <>
      <WebPlayer setPlayerState={setPlayerState} />
      <IconButton size="small" onClick={() => spotifyCommand(`previous`)}>
        <SkipPrevious />
      </IconButton>
      <IconButton size="small" onClick={togglePlay}>
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      <audio
        ref={audioRef}
        src="https://direct.fipradio.fr/live/fip-midfi.mp3"
      ></audio>

      <IconButton size="small" onClick={() => spotifyCommand('next')}>
        <SkipNext />
      </IconButton>
      <Typography variant="caption" marginRight={5}>
        {valuetext(Math.min(playPosition, duration))}
      </Typography>
      <Slider
        size="small"
        min={0}
        value={playPosition}
        max={duration}
        step={1}
        getAriaValueText={valuetext}
        onChange={onPlayPositionClick}
      />
      <Typography variant="caption" marginLeft={5}>
        {valuetext(duration)}
      </Typography>
    </>
  );
}
