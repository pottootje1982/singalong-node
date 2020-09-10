import axios from 'axios'
import { getCookie } from './cookie'

axios.defaults.baseURL =
  process.env.NODE_ENV !== 'production'
    ? 'http://local.host:5000'
    : 'https://singalongify.herokuapp.com'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['accessToken'] = getCookie('accessToken')
axios.defaults.headers.common['refreshToken'] = getCookie('refreshToken')

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

export default axios
