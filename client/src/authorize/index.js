import React, { useState, useEffect } from 'react'
import qs from 'qs'
import server from '../server'
import { Redirect } from 'react-router-dom'

function Authorize() {
  server.get('/v2/authorize').then((res) => {
    window.location = res.data
  })
  return <React.Fragment />
}

export function Authorized({ location }) {
  const query = location.search
  const { code } = qs.parse(query, { ignoreQueryPrefix: true })

  const [token, setToken] = useState()

  useEffect(() => {
    server
      .get(`/v2/authorize/token?code=${code}`)
      .then((res) => {
        const body = res.data.body
        const accessToken = body && body.access_token

        if (accessToken) {
          setToken(accessToken)
        }
      })
      .catch((err) => console.log(err))
  }, [code])
  if (token) {
    return <Redirect to={`/main?token=${token}`} />
  } else return <React.Fragment />
}

export default Authorize
