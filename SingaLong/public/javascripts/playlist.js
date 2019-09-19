function showCurrentlyPlaying() {
    ajax('/currently-playing', {}, refreshPlaylist);
}

function filterOnDownloadStatus() {
    ajax('/find-in-database', { notDownloaded: true }, refreshPlaylistControls);
}

var currentPlaylist;

function refreshPlaylistControls(res) {
    var context = res.context;
    $('#create-songbook').prop('disabled', !res.canCreateSongbook);

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
    if (res.context.playlistId != currentPlaylist) return;
    refreshPlaylistControls(res);
    if (res.hasMore)
        ajax('/playlist', res, refreshPlaylist);
    else
        ajax('/find-in-database', res, function(res) {
            refreshPlaylistControls(res);
            ajax('/current-track', {}, setCurrentTrack)
        });
}

function showPlaylist(userId, playlistId) {
    currentPlaylist = playlistId;
    var data = {
        notDownloaded: false,
        newContext: { userId: userId, playlistId: playlistId },
        offset: 0
    };
    ajax('/playlist', data, refreshPlaylist);
    $('#create-songbook').prop('disabled', true);
    getCurrentTrack();
}

function removeArtist() {
    $(".track").each(function(index, track) {
        track.text = (index+1) + '. ' + track.dataset.title;
        track.dataset.artist = '';
    });
}

function cleanString(str) {
    var regex = /([^\(\)\[\]]*)/i;
    var result = str.match(regex);
    return result !== null && result.length > 1 ? result[1].trim() : str;
}

function getMinimalTitle(title) {
    return cleanString(title.split(' - ', 1)[0]);
}

function minimizeTitle() {
    $(".track").each(function (index, track) {
        var artist = track.dataset.artist;
        artist = artist !== '' ? artist + ' - ' : '';
        track.dataset.title = getMinimalTitle(track.dataset.title);
        track.text = (index + 1) + '. ' + artist + track.dataset.title;
    });
}

function setCurrentTrack(res) {
    setTrackSliderPosition(res);
    console.log('show lyrics of ', res.id);
    getLyrics(res.id, res.artist, res.title, res.site, false);
}

function prevTrack() {
    ajax('/skip-to-track', {}, setCurrentTrack);
}

function nextTrack() {
    ajax('/skip-to-track', {next:true}, setCurrentTrack);
}
