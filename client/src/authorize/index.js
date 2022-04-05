import React, { useEffect, useContext, useState } from 'react'
import ServerContext from '../server-context'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  useEffect(init, [server])
  return <React.Fragment />
}

export function Authorized() {
  const [searchParams] = useSearchParams();
  const [code] = useState(searchParams.get('code'))
  const navigate = useNavigate()

  const { server } = useContext(ServerContext)

  function init() {
    server()
      .get(`/api/authorize/token?code=${code}`)
      .then((res) => {
        const { data: { access_token, refresh_token, expires_in } = {} } = res || {}
        if (access_token) {
          setCookie('accessToken', access_token, expires_in / 3600)
          setCookie('refreshToken', refresh_token)
          navigate('/playlist')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(init, [code, navigate, server])
  return <React.Fragment />
}

export default Authorize
