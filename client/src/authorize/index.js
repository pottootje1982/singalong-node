import React, { useState, useEffect } from 'react'
import qs from 'qs'
import server, { get } from '../server'
import { Redirect } from 'react-router-dom'

function Authorize() {
  get('/authorize').then((res) => {
    window.location = res.data
  })
  return <React.Fragment />
}

export function Authorized({ location }) {
  const query = location.search
  const { code } = qs.parse(query, { ignoreQueryPrefix: true })

  const [token, setToken] = useState()

  useEffect(() => {
    get(`/authorize/token?code=${code}`)
      .then(({ data }) => {
        if (data) {
          server.setToken(data)
          setToken(data)
        }
      })
      .catch((err) => console.log(err))
  }, [code])
  if (token) {
    return <Redirect to={'/main'} />
  } else return <React.Fragment />
}

export default Authorize
