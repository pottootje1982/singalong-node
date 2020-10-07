import React, { useEffect } from 'react'
import qs from 'qs'
import server, { get } from '../server'
import { useHistory } from 'react-router-dom'

function Authorize() {
  get('/api/authorize').then((res) => {
    const { data } = res || {}
    if (data) window.location = res.data
  })
  return <React.Fragment />
}

export function Authorized({ location }) {
  const query = location.search
  const { code } = qs.parse(query, { ignoreQueryPrefix: true })
  const history = useHistory()

  useEffect(() => {
    get(`/api/authorize/token?code=${code}`)
      .then((res) => {
        const { data } = res || {}
        if (data) {
          server.setToken(data)
          history.push('/playlist')
        }
      })
      .catch((err) => console.log(err))
  }, [code, history])
  return <React.Fragment />
}

export default Authorize
