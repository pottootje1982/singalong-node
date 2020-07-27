import axios from 'axios'

axios.defaults.baseURL =
  process.env.NODE_ENV !== 'production'
    ? 'http://local.host:5000'
    : 'https://gogetmeals.herokuapp.com'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['accessToken'] = process.env.REACT_APP_TOKEN

export function setToken(token) {
  if (token) {
    axios.defaults.headers.common['accessToken'] = token
  }
}

export default axios
