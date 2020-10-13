import React, { useEffect, useContext } from 'react'
import qs from 'qs'
import ServerContext from '../server-context'
import { useHistory } from 'react-router-dom'

function Authorize() {
  const { server } = useContext(ServerContext)

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
  const { server, setTokens } = useContext(ServerContext)

  function init() {
    server
      .get(`/api/authorize/token?code=${code}`)
      .then((res) => {
        const { data } = res || {}
        if (data) {
          setTokens(data)
          history.push('/playlist')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(init, [])
  return <React.Fragment />
}

export default Authorize
