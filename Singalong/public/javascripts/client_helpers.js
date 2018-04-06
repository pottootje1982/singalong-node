var downloading = false;

function startDownloadingPlaylist() {
    downloading = true;
    $('.download-button').text('Cancel');
    var sleepTime = parseInt($('#sleepTimeInput').val());
    downloadPlaylistRecursive($(".track"), sleepTime, 0);
}

function updateTextualPlaylist(res) {
    $('#playlist').replaceWith(res.playlistHtml);
    $('#playlistText').val(res.textualPlaylist);
    startDownloadingPlaylist();
}

function downloadPlaylist(fullPlaylist) {
    if (downloading) {
        downloading = false;
    } else {
        if (fullPlaylist) startDownloadingPlaylist();
        else {
            var data = { playlist: $('#playlistText').val() };
            ajax('/playlist-to-download', data, updateTextualPlaylist);
        }
    }
}

function getTrack(trackElement) {
    trackElement = $(trackElement);
    return { artist: trackElement.attr('data-artist'), title: trackElement.attr('data-title'), id: trackElement.attr('data-id') };
}

function colorTrack(index, color) {
    $("#" + index).css({ 'color': color });
}

function updateDownloadStatus(playlist, sleepTime, index) {
    return function(result) {
        var track = result.track;
        console.log('Downloaded ', track, track.lyrics != null, "#" + index);
        if (track.lyrics != null) {
            colorTrack(index, 'green');
        } else {
            colorTrack(index, 'red');
        }
        downloadPlaylistRecursive(playlist.slice(1), sleepTime, index + 1);
    }
}

function downloadPlaylistRecursive(playlist, sleepTime, index) {
    if (playlist.length === 0 || !downloading) {
        downloading = false;
        $('.download-button').text('Download');
        return;
    }
    colorTrack(index ,'orange');
    ajax('/download-track', { track: getTrack(playlist[0]), sleepTime: sleepTime }, updateDownloadStatus(playlist, sleepTime, index));
}

function modifyTextualPlaylist(url) {
    var data = { playlist: $('#playlistText').val() };
    ajax(url, data, function (textualPlaylist) {
            $('#playlistText').val(textualPlaylist);
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

function updateLyrics(html) {
    $('#track-section').replaceWith(html);
    if ($('#collapseThree').attr('aria-expanded') !== "true")
        $('#collapseThree').collapse('show');
}

function getLyrics(id, artist, title, site) {
    ajax('/lyrics', {artist: artist, title:title, id:id, site:site}, updateLyrics);
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

function showCurrentlyPlaying() {
    ajax('/currently-playing', {}, refreshPlaylist);
}

function filterOnDownloadStatus() {
    ajax('/find-in-database', { notDownloaded: true }, refreshPlaylistControls);
}

function storeLyrics() {
    ajax('/lyrics', { lyrics: $('#lyrics-display').val() }, refreshPlaylist, 'POST');
}

function clearLyricsText(res) {
    $('#lyrics-display').val('');
    refreshPlaylist(res);
}

function removeLyrics() {
    ajax('/lyrics', {}, clearLyricsText, 'DELETE');
}

function playTrack(trackId, artist, title) {
    console.log("Playing track " + trackId);
    ajax('/play-track', { trackId: trackId });
    getLyrics(artist, title);
}

function customSearch(index, trackId, artist, title) {
    $('#dialog').attr('data-id', trackId);
    $('#dialog').attr('data-index', index);
    $('#custom-artist').val(artist);
    $('#custom-title').val(title);
    $("#dialog").dialog("open");
}

function initDialog() {
    $("#dialog").dialog({
        autoOpen: false,
        width: 600,
        buttons: {
            Ok: function () {
                var id = $('#dialog').attr('data-id');
                var index = $('#dialog').attr('data-index');
                var artist = $('#custom-artist').val();
                var title = $('#custom-title').val();
                ajax('/download-track', { track: {artist: artist, title: title, id: id} }, updateDownloadStatus([], null, index));
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}

$(document).ready(function () {
    $("#collapseTwo").collapse();
    var playlistLinks = $('#playlist-link:first');

    initDialog();

    if (playlistLinks != null) {
        playlistLinks.trigger('click');
    }

    setInterval(function() {
        console.log('Refreshing token');
        ajax('/refreshToken',
            {},
            function(res) {
                console.log('New access token ' + res.accessToken);
                $('#main-divider').attr('data-access-token', res.accessToken);
            });
    }, 1000 * 3600);
});


