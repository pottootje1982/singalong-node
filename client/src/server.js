import axios from 'axios'
import { getCookie, setCookie } from './cookie'

axios.defaults.baseURL =
  process.env.NODE_ENV !== 'production'
    ? 'http://local.host:5000'
    : 'https://singalongify.herokuapp.com'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
//axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
//axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
//axios.defaults.withCredentials = true

let defaultAxios = createDefault()
export let spotifyAxios = createSpotifyAxios()

function createDefault() {
  return axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
      accessToken: getCookie('accessToken'),
      refreshToken: getCookie('refreshToken'),
    },
  })
}

function createSpotifyAxios() {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      Authorization: `Bearer ${getCookie('accessToken')}`,
    },
  })
}

export function getFreshToken() {
  return defaultAxios
    .get('/api/authorize/refresh', {
      refreshToken: getCookie('refreshToken'),
    })
    .then((res) => {
      const { data } = res || {}
      if (data) {
        console.log('Refreshed token to ', data)
        setToken(data)
        return data.access_token
      }
    })
    .catch(console.log)
}

let tokenUpdater

export function setToken(tokens) {
  const { access_token, refresh_token, expires_in } = tokens
  if (access_token) {
    setCookie('accessToken', access_token, expires_in / 3600)

    clearInterval(tokenUpdater)
    tokenUpdater = setInterval(() => {
      getFreshToken()
    }, 3600 * 1000)

    if (refresh_token) {
      setCookie('refreshToken', refresh_token)
    }
    defaultAxios = createDefault()
    spotifyAxios = createSpotifyAxios()
  }
}

defaultAxios.setToken = setToken

export default defaultAxios
