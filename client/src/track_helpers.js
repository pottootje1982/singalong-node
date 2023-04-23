function cleanString(str) {
  const regex = /([^[\]]+)/i;
  var result = str.match(regex);
  result = result && result.length > 1 ? result[1] : str;
  result = result.replace(/(.+)(\(.*)/, "$1");
  return result.trim();
}

function getMinimalTitle(title) {
  return cleanString(title.split(" - ", 1)[0]);
}

module.exports = {
  cleanString,
  getMinimalTitle,
};
