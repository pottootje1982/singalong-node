function cleanString(str) {
  var regex = /([^()[\]]*)/i
  var result = str.match(regex)
  return result != null && result.length > 1 ? result[1].trim() : str
}

function getMinimalTitle(title) {
  return cleanString(title.split(' - ', 1)[0])
}

module.exports = {
  cleanString,
  getMinimalTitle,
}
