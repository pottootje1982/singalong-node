import React, { useState, useEffect } from 'react'
import qs from 'qs'
import { get } from '../server'
import { Redirect } from 'react-router-dom'
import { setCookie } from '../cookie'

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
      .then((res) => {
        const body = res.data.body || {}
        const { access_token, refresh_token } = body

        if (access_token) {
          setCookie('accessToken', access_token, 1)
          setCookie('refreshToken', refresh_token)
          setToken(access_token)
        }
      })
      .catch((err) => console.log(err))
  }, [code])
  if (token) {
    return <Redirect to={'/main'} />
  } else return <React.Fragment />
}

export default Authorize
