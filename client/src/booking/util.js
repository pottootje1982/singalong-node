const axios = require('axios')
const timeMatch = /listItemTask\('form','time','(.*?)'.*"/g

const neoliet = axios.create({
  baseURL: 'https://mijn2.klim.nl',
})

async function getTimes() {
  const page = await axios.get('http://mijn.klim.nl/bolder?p=50')
  const result = []
  do {
    const [, timestamp] = timeMatch.exec(page) || []
    if (timestamp) result.push(timestamp)
  } while (timeMatch.lastIndex > 0)
  return result
}

async function step2() {
  var FormData = require('form-data')
  var data = new FormData()
  data.append('time', '1607688000.0.8_8053')
  data.append('task', 'makeBooking')

  var config = {
    method: 'get',
    url:
      'https://stackoverflow.com/questions/18642828/origin-origin-is-not-allowed-by-access-control-allow-origin',
    headers: {
      // Cookie: 'PHPSESSID=14md4lcb4lv53s0bbmau7524k2',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      // 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      // 'Access-Control-Allow-Headers':
      //   'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    },
  }

  // const response = await axios.post(
  //   'https://mijn2.klim.nl/bolder/stap2.html',
  //   { data },
  //   config
  // )
  const response = await axios(config)
  //const response = await request(config)
  return response
}

function makeReservation() {
  return step2()
}

module.exports = { makeReservation, getTimes }
