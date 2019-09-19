cleanString = function(str) {
    var regex = /([^\(\)\[\]]*)/i;
    var result = str.match(regex);
    return result != null && result.length > 1 ? result[1].trim() : str;
}

getMinimalTitle = function(title) {
    return cleanString(title.split(' - ', 1)[0]);
}

module.exports = {
    cleanString: cleanString,
    getMinimalTitle: getMinimalTitle
}
