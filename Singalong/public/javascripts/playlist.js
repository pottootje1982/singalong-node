function showCurrentlyPlaying() {
    ajax('/currently-playing', {}, refreshPlaylist);
}

function filterOnDownloadStatus() {
    ajax('/find-in-database', { notDownloaded: true }, refreshPlaylistControls);
}

function refreshPlaylistControls(res) {
    var context = res.context;
    if (res.updateTextualPlaylist)
        $('#playlistText').val(res.textualPlaylist);
    if (res.playlistHtml)
        $('#playlist').replaceWith(res.playlistHtml);
    var name;
    if (context.playlistId && context.userId)
        name = $("a[data-user-id=" + context.userId + "][data-playlist-id='" + context.playlistId + "']").text();
    else
        name = $('#currently-playing-link').text();
    $('#playlistText').prop('data-no-artist', false);
    $('#playlist-title').text(name);
    $('#remove-artist-button').prop('disabled', false);
    $('#minimize-title-button').prop('disabled', false);
    // Don't sent these values back to find-in-database
    res.playlistHtml = null;
    res.textualPlaylist = null;
}

function refreshPlaylist(res) {
    refreshPlaylistControls(res);
    ajax('/find-in-database', res, refreshPlaylistControls);
}

function showPlaylist(userId, playlistId) {
    var data = {
        notDownloaded: false,
        newContext: { userId: userId, playlistId: playlistId }
    }
    ajax('/playlist', data, refreshPlaylist);
}

