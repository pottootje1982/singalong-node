import React, { useState, useEffect, createContext } from "react";

const PlayerContext = createContext();

export default PlayerContext;

export function PlayerProvider(props) {
  const [isPlaying, setIsPlaying] = useState();
  const [monitorCurrentlyPlaying, setMonitorCurrentlyPlaying] = useState(true);
  const [device, setDevice] = useState(
    localStorage.getItem("lastPlayingDevice")
  );
  const [playerState, setPlayerState] = useState();

  function storeDevice() {
    if (device) localStorage.setItem("lastPlayingDevice", device);
  }

  useEffect(storeDevice, [device]);

  const values = {
    isPlaying,
    setIsPlaying,
    monitorCurrentlyPlaying,
    setMonitorCurrentlyPlaying,
    device,
    setDevice,
    playerState,
    setPlayerState,
  };

  return (
    <PlayerContext.Provider value={values}>
      {props.children}
    </PlayerContext.Provider>
  );
}
