import React, { useEffect } from 'react'
import qs from 'qs'
import server from '../server'
import { useHistory } from 'react-router-dom'

function Authorize() {
  function init() {
    server.get('/api/authorize').then(({ data }) => {
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

  function init() {
    server
      .get(`/api/authorize/token?code=${code}`)
      .then((res) => {
        const { data } = res || {}
        if (data) {
          server.setToken(data)
          history.push('/playlist')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(init, [])
  return <React.Fragment />
}

export default Authorize
