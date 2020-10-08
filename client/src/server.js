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
  const result = axios.create({
    baseURL: axios.defaults.baseURL,
  })
  result.interceptors.request.use((config) => {
    const accessToken = getCookie('accessToken')
    const refreshToken = getCookie('refreshToken')
    if (accessToken) config.headers.accessToken = accessToken
    if (refreshToken) config.headers.refreshToken = refreshToken
    return config
  })
  return result
}

function createSpotifyAxios() {
  const result = axios.create({
    baseURL: 'https://api.spotify.com/v1',
  })
  result.interceptors.request.use((config) => {
    const accessToken = getCookie('accessToken')
    if (accessToken)
      config.headers.Authorization = `Bearer ${getCookie('accessToken')}`
    return config
  })
  return result
}

export function getFreshToken() {
  return defaultAxios
    .get('/api/authorize/refresh', {
      refreshToken: getCookie('refreshToken'),
    })
    .then(({ data }) => {
      const { access_token } = data || {}
      if (access_token) {
        setToken(data)
        return access_token
      }
    })
    .catch(console.log)
}

export function setToken(tokens) {
  const { access_token, refresh_token, expires_in } = tokens
  if (access_token) {
    setCookie('accessToken', access_token, expires_in / 3600)

    if (refresh_token) {
      setCookie('refreshToken', refresh_token)
    }
    defaultAxios = createDefault()
    spotifyAxios = createSpotifyAxios()
  }
}

defaultAxios.setToken = setToken

export default defaultAxios
