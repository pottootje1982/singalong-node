import React, { useEffect } from 'react'
import { makeReservation } from './util'

export default function Booking() {
  function fireReservation() {
    makeReservation().then(console.log)
  }

  useEffect(fireReservation, [])

  return <></>
}
