var downloading = false;

function startDownloadingPlaylist() {
    downloading = true;
    $('#downloadButton').text('Cancel');
    var sleepTime = parseInt($('#sleepTimeInput').val());
    downloadPlaylistRecursive($(".track"), sleepTime, 0);
}

function downloadPlaylist(fullPlaylist) {
    if (downloading) {
        downloading = false;
    } else {
        if (fullPlaylist) startDownloadingPlaylist();
        else
            $.ajax({
                url: '/playlist-to-download',
                data: { playlist: $('#playlistText').val() },
                success: function (res) {
                    $('#playlist').parent().html(res.playlistHtml);
                    $('#playlistText').val(res.textualPlaylist);
                    startDownloadingPlaylist();
                },
                error: function (xhr, exception) { alert("An error occured when getting playlist: " + xhr.status + " " + xhr.statusText + '\n' + exception);}
            });
    }
}

function getTrack(trackElement) {
    trackElement = $(trackElement);
    return { artist: trackElement.attr('data-artist'), title: trackElement.attr('data-title') };
}

function downloadPlaylistRecursive(playlist, sleepTime, index) {
    if (playlist.length === 0 || !downloading) {
        downloading = false;
        $('#downloadButton').text('Download');
        return;
    }

    $("#" + index).css({ 'color': 'orange' });

    $.ajax({
        url: '/download-track',
        data: { track: getTrack(playlist[0]), sleepTime: sleepTime },
        success: function (result) {
            var track = result.track;
            console.log('Downloaded ', track, track.lyrics != null, "#" + index);
            if (track.lyrics != null) {
                $("#" + index).css({ 'color': 'green' });
            } else {
                $("#" + index).css({ 'color': 'red' });
            }
            downloadPlaylistRecursive(playlist.slice(1), sleepTime, index + 1);
        },
        error: function (xhr, exception) { alert("An error occured: " + xhr.status + " " + xhr.statusText + '\n' + exception); }
    });
}

function getSelectedPlaylist() {
    return { userId: $('#playlist').attr('data-user-id'), playlistId: $('#playlist').attr('data-playlist') };
}

function removeArtist() {
    $.ajax({
        url: '/playlist-without-artist',
        data: getSelectedPlaylist(),
        success: function(textualPlaylist) {
            $('#playlistText').val(textualPlaylist);
        }
});
}

function getLyrics(artist, title, site) {
    $('#track-section').show();
    $.ajax({
        url: '/lyrics',
        data: {artist: artist, title:title, site:site},
        success: function(html) {
            $('#track-section').parent().html(html);
        }
    });
}

function refreshPlaylist(res) {
    $('#playlistText').val(res.textualPlaylist);
    $('#playlist').parent().html(res.playlistHtml);
}

function showPlaylist(userId, playlistId) {
    $.ajax({
        url: '/playlist',
        data: { userId: userId, id: playlistId },
        success: refreshPlaylist
    });
}

function filterOnDownloadStatus() {
    var data = getSelectedPlaylist();
    data.downloaded = false;
    $.ajax({
        url: '/filter-on-download-status',
        data: data,
        success: refreshPlaylist
    });
}

function getSelectedTrack(lyrics) {
    var result = {
        track: $('#lyrics-display').attr('data-track'),
        title: $('#lyrics-display').attr('data-title')
    };
    if (lyrics != null)
        result.lyrics = lyrics;
    return result;
}

function storeLyrics() {
    $.ajax({
        url: 'lyrics', type: 'POST',
        data: getSelectedTrack($('#lyrics-display').val())
    });
}

function removeLyrics() {
    $.ajax({
        url: 'lyrics',
        type: 'DELETE',
        data: getSelectedTrack()
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

function toggleLyrics() {
    toggleVisibility('#track-section');
}

function playTrack() {
    $.ajax({
        url: '/play-track', type: 'POST',
        data: { userId: $('#userId').val(),
            playlistId: $('#playlistId').val(),
            trackId: $('#trackId').val()
        }
    });
}

$(document).ready(function () {
    $("#collapseTwo").collapse();
    var playlistLinks = $('#playlist-link:first');
    if (playlistLinks != null) {
        playlistLinks.trigger('click');
    }
});