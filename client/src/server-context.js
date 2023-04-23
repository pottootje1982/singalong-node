import axios from "axios";
import { getCookie, setCookie } from "./cookie";
import React, { createContext } from "react";

axios.defaults.baseURL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5000"
    : "https://singalongify.onrender.com";
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
//axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
//axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
//axios.defaults.withCredentials = true

const ServerContext = createContext();

export default ServerContext;

export function ServerProvider(props) {
  function server() {
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

    return axios.create({
      baseURL: axios.defaults.baseURL,
      headers: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  }

  function spotifyAxios() {
    const accessToken = getCookie("accessToken");
    return axios.create({
      baseURL: "https://api.spotify.com/v1",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  function getFreshToken() {
    return server()
      .get("/api/authorize/refresh", {
        refreshToken: getCookie("refreshToken"),
      })
      .then(({ data }) => {
        console.log("Refreshing token", data);
        const { access_token, refresh_token, expires_in } = data || {};
        if (access_token) {
          setCookie("accessToken", access_token, expires_in / 3600);
          return access_token;
        }
        if (refresh_token) {
          setCookie("refreshToken", refresh_token);
        }
      })
      .catch(console.log);
  }

  const values = {
    server,
    spotifyAxios,
    getFreshToken,
  };

  return (
    <ServerContext.Provider value={values}>
      {props.children}
    </ServerContext.Provider>
  );
}
