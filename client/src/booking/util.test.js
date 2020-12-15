const axios = require('axios')
const fs = require('fs')
const { getTimes } = require('./booking')

jest.mock('axios')

beforeEach(() => {
  jest.resetAllMocks()
})

test('Gets available time slots', async () => {
  const page = fs.readFileSync('./routes/misc/step2.html', 'utf8')
  axios.get.mockResolvedValueOnce(page)
  expect(await getTimes()).toEqual([
    '1607979600.0.1_8095',
    '1607999600.0.1_9095',
  ])
})
