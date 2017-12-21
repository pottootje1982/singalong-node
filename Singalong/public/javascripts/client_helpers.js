var downloading = false;

function startDownloadingPlaylist() {
    downloading = true;
    $('.download-button').text('Cancel');
    var sleepTime = parseInt($('#sleepTimeInput').val());
    downloadPlaylistRecursive($(".track"), sleepTime, 0);
}

function downloadPlaylist(fullPlaylist) {
    if (downloading) {
        downloading = false;
    } else {
        if (fullPlaylist) startDownloadingPlaylist();
        else
            var data = getSelectedPlaylist();
            data.playlist = $('#playlistText').val();
            $.ajax({
                url: '/playlist-to-download',
                data: data,
                success: function (res) {
                    $('#playlist').replaceWith(res.playlistHtml);
                    $('#playlistText').val(res.textualPlaylist);
                    startDownloadingPlaylist();
                },
                error: showError
            });
    }
}

function getTrack(trackElement) {
    trackElement = $(trackElement);
    return { artist: trackElement.attr('data-artist'), title: trackElement.attr('data-title') };
}

function colorTrack(index, color) {
    $("#" + index).css({ 'color': color });
}

function downloadPlaylistRecursive(playlist, sleepTime, index) {
    if (playlist.length === 0 || !downloading) {
        downloading = false;
        $('.download-button').text('Download');
        return;
    }

    colorTrack(index ,'orange');

    $.ajax({
        url: '/download-track',
        data: { track: getTrack(playlist[0]), sleepTime: sleepTime },
        success: function (result) {
            var track = result.track;
            console.log('Downloaded ', track, track.lyrics != null, "#" + index);
            if (track.lyrics != null) {
                colorTrack(index, 'green');
            } else {
                colorTrack(index, 'red');
            }
            downloadPlaylistRecursive(playlist.slice(1), sleepTime, index + 1);
        }, error: showError
    });
}

function getSelectedPlaylist() {
    return {context: {
        userId: $('#playlist').attr('data-user-id'),
        playlistId: $('#playlist').attr('data-playlist'),
        albumId: $('#playlist').attr('data-album-id')
    }};
}

function modifyTextualPlaylist(url) {
    var data = getSelectedPlaylist();
    data.playlist = $('#playlistText').val();
    $.ajax({
        url: url,
        data: data,
        success: function (textualPlaylist) {
            $('#playlistText').val(textualPlaylist);
        }, error: showError
    });
}

function removeArtist() {
    modifyTextualPlaylist('/playlist-without-artist');
    $('#playlistText').prop('data-no-artist', true);
    $('#remove-artist-button').prop('disabled', true);
}

function minimizeTitle() {
    modifyTextualPlaylist('/minimize-title?noArtist=' + $('#playlistText').prop('data-no-artist'));
    $('#minimize-title-button').prop('disabled', true);
}

function getLyrics(artist, title, site) {
    $.ajax({
        url: '/lyrics',
        data: {artist: artist, title:title, site:site},
        success: function(html) {
            $('#track-section').replaceWith(html);
            if ($('#collapseThree').attr('aria-expanded') !== "true")
                $('#collapseThree').collapse('show');
        }, error: showError
    });
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
    res.textualPlaylist = null;
    res.playlistHtml = null;
}

function refreshPlaylist(res) {
    refreshPlaylistControls(res);
    $.ajax({
        url: '/find-in-database',
        data: res,
        success: refreshPlaylistControls, error: showError
    });
}

function showPlaylist(userId, playlistId) {
    var data = getSelectedPlaylist();
    data.oldContext = data.context;
    data.context = { userId: userId, playlistId: playlistId }
    data.notDownloaded = false;
    $.ajax({
        url: '/playlist',
        data: data,
        success: refreshPlaylist,
        error: showError
    });
}

function showCurrentlyPlaying() {
    var currentPlaylist = getSelectedPlaylist();
    currentPlaylist.oldContext = currentPlaylist.context;
    $.ajax({
        url: '/currently-playing',
        data: currentPlaylist,
        success: refreshPlaylist,
        error: showError
    });
}

function filterOnDownloadStatus() {
    var data = getSelectedPlaylist();
    data.notDownloaded = true;
    refreshPlaylist(data);
}

function getSelectedTrack(lyrics) {
    var result = getSelectedPlaylist();
    result.artist = $('#lyrics-display').attr('data-artist');
    result.title = $('#lyrics-display').attr('data-title');
    if (lyrics != null)
        result.lyrics = lyrics;
    return result;
}

function storeLyrics() {
    $.ajax({
        url: 'lyrics', type: 'POST',
        data: getSelectedTrack($('#lyrics-display').val()), error: showError
    });
}

function removeLyrics() {
    var selTrack = getSelectedTrack();
    $.ajax({
        url: 'lyrics',
        type: 'DELETE',
        data: selTrack,
        success: res => {
            $('#lyrics-display').val('');
            refreshPlaylist(res);
        }, error: showError
    });
}

function toggleVisibility(controlId) {
    var control = $(controlId);
    var visibility = control.css('display');
    control.css('display', (visibility === 'block') ? 'none' : 'block');
}

function toggleSpotifyPlayer() {
    toggleVisibility('#spotify-player');
}

function playTrack(trackId) {
    $.ajax({
        url: '/play-track', type: 'POST',
        data: { userId: $('#userId').val(),
            playlistId: $('#playlistId').val(),
            trackId: trackId
        }, error: showError
    });
}

function showError(res) {
    $('#alert-message').text(res && res.responseJSON ? res.responseJSON.error : res.error);
    $('#alert-section').css('display', 'block');
    window.setTimeout(() => {
        $('#alert-section').css('display', 'none');
    }, 10000);
}

$(document).ready(function () {
    $("#collapseTwo").collapse();
    var playlistLinks = $('#playlist-link:first');
    if (playlistLinks != null) {
        playlistLinks.trigger('click');
    }
});