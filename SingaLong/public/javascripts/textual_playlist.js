function removeArtistFromTextualPlaylist() {
    modifyTextualPlaylist('/playlist-without-artist');
    $('#playlistText').prop('data-no-artist', true);
    $('#remove-artist-button').prop('disabled', true);
}

function minimizeTitleFromTextualPlaylist() {
    modifyTextualPlaylist('/minimize-title?noArtist=' + $('#playlistText').prop('data-no-artist'));
    $('#minimize-title-button').prop('disabled', true);
}

function modifyTextualPlaylist(url) {
    var data = { playlist: $('#playlistText').val() };
    ajax(url, data, function (textualPlaylist) {
        $('#playlistText').val(textualPlaylist);
    });
}

function updateTextualPlaylist(res) {
    $('#playlist').replaceWith(res.playlistHtml);
    $('#playlistText').val(res.textualPlaylist);
    startDownloadingPlaylist();
}