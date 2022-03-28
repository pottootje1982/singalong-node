import axios from 'axios'
import { getCookie, setCookie } from './cookie'
import React, { createContext, useEffect, useState } from 'react'

axios.defaults.baseURL =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5000'
    : 'https://singalongify.herokuapp.com'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
//axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
//axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
//axios.defaults.withCredentials = true

const ServerContext = createContext()

export default ServerContext

export function ServerProvider(props) {
  const [tokens, setTokens] = useState({
    access_token: getCookie('accessToken'),
    refresh_token: getCookie('refreshToken'),
    expires_in: 3600,
  })
  const [server, setServer] = useState(createDefault)
  const [spotifyAxios, setSpotifyAxios] = useState(createSpotifyAxios)

  function createDefault() {
    return axios.create({
      baseURL: axios.defaults.baseURL,
      headers: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    })
  }

  function createSpotifyAxios() {
    return axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
  }

  function onTokensUpdate() {
    const { access_token, refresh_token, expires_in } = tokens || {}
    if (access_token) {
      setCookie('accessToken', access_token, expires_in / 3600)

      if (refresh_token) {
        setCookie('refreshToken', refresh_token)
      }
      setServer(createDefault)
      setSpotifyAxios(createSpotifyAxios)
    }
  }
  useEffect(onTokensUpdate, [tokens])

  function getFreshToken() {
    return server
      .get('/api/authorize/refresh', {
        refreshToken: getCookie('refreshToken'),
      })
      .then(({ data }) => {
        console.log('Refreshing token', data)
        const { access_token } = data || {}
        if (access_token) {
          setTokens(data)
          return access_token
        }
      })
      .catch(console.log)
  }

  const values = {
    server,
    spotifyAxios,
    getFreshToken,
    setTokens,
  }

  return (
    <ServerContext.Provider value={values}>
      {props.children}
    </ServerContext.Provider>
  )
}
