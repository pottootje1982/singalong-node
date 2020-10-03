import React, { useEffect } from 'react'
import qs from 'qs'
import server, { get } from '../server'
import { useHistory } from 'react-router-dom'

function Authorize() {
  get('/authorize').then((res) => {
    window.location = res.data
  })
  return <React.Fragment />
}

export function Authorized({ location }) {
  const query = location.search
  const { code } = qs.parse(query, { ignoreQueryPrefix: true })
  const history = useHistory()

  useEffect(() => {
    get(`/authorize/token?code=${code}`)
      .then(({ data }) => {
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
