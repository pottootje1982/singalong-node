import axios from 'axios'
import { getCookie, setCookie } from './cookie'

axios.defaults.baseURL =
  process.env.NODE_ENV !== 'production'
    ? 'http://local.host:5000'
    : 'https://singalongify.herokuapp.com'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
//axios.defaults.withCredentials = true
axios.defaults.headers.common['accessToken'] = getCookie('accessToken')
axios.defaults.headers.common['refreshToken'] = getCookie('refreshToken')

export function setToken(tokens) {
  const { access_token, refresh_token, expires_in } = tokens
  axios.defaults.headers.common['accessToken'] = access_token
  setCookie('accessToken', access_token, expires_in / 3600)
  if (refresh_token) {
    axios.defaults.headers.common['refreshToken'] = refresh_token
    setCookie('refreshToken', refresh_token)
  }
}

export function get(...params) {
  return axios.get(...params).catch(({ response }) => {
    if (response && response.status === 401) window.location = '/'
  })
}

export function post(...params) {
  return axios.post(...params).catch(({ response }) => {
    if (response && response.status === 401) window.location = '/'
  })
}

export function del(...params) {
  return axios.delete(...params).catch(({ response }) => {
    if (response && response.status === 401) window.location = '/'
  })
}

axios.setToken = setToken

export default axios
