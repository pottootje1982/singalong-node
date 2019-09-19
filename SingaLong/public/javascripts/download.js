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
        else {
            var data = { playlist: $('#playlistText').val() };
            ajax('/playlist-to-download', data, updateTextualPlaylist);
        }
    }
}

function getTrack(trackElement) {
    trackElement = $(trackElement);
    return { artist: trackElement.attr('data-artist'), title: trackElement.attr('data-title'), id: trackElement.prop('id') };
}

function colorTrack(id, color) {
    $("#" + id).css({ 'color': color });
}

function updateDownloadStatus(playlist, sleepTime, index, updateLyrics) {
    return function(result) {
        var track = result.track;
        if (updateLyrics)
            $('#lyrics-display').val(track.lyrics);
        console.log('Downloaded ', track.id, track.lyrics != null, "#" + index);
        if (track.lyrics != null) {
            colorTrack(track.id, 'green');
        } else {
            colorTrack(track.id, 'red');
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