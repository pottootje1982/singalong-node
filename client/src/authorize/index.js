import React, { useEffect, useContext } from 'react'
import qs from 'qs'
import ServerContext from '../server-context'
import { useHistory } from 'react-router-dom'
import { setCookie } from '../cookie'

function Authorize() {
  const { server } = useContext(ServerContext)

  function init() {
    server().get('/api/authorize').then(({ data }) => {
      if (data) {
        window.location = data
      }
    })
  }
  useEffect(init, [])
  return <React.Fragment />
}

export function Authorized({ location }) {
  const query = location.search
  const { code } = qs.parse(query, { ignoreQueryPrefix: true })
  const history = useHistory()
  const { server } = useContext(ServerContext)

  function init() {
    server()
      .get(`/api/authorize/token?code=${code}`)
      .then((res) => {
        const { data: { access_token, refresh_token, expires_in } = {} } = res || {}
        if (access_token) {
          setCookie('accessToken', access_token, expires_in / 3600)
          setCookie('refreshToken', refresh_token)
          history.push('/playlist')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(init, [])
  return <React.Fragment />
}

export default Authorize
