import request = require('request-promise')
var google = require('googleapis')
var customsearch = google.customsearch('v1')
const config = require('../config')

export function search(artist, title, onResponse) {
  customsearch.cse.list(
    {
      q: artist + ' ' + title + ' lyrics',
      auth: config.GoogleApiKey,
      cx: config.GoogleSearchEngineId
    },
    (err, resp) => {
      if (err) {
        return console.log('An error occured', err)
      }
      // Got the response from custom search
      console.log('Result: ' + resp.searchInformation.formattedTotalResults)
      if (resp.items && resp.items.length > 0) {
        console.log('First result name is ' + resp.items[0].formattedUrl)
      }
      request(resp.items[0].formattedUrl).then(onResponse)
    }
  )
}
