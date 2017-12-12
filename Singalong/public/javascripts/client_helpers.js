var downloading = false;

function downloadPlaylist(playlist) {
    if (downloading) {
        downloading = false;
    } else {
        downloading = true;
        $('#downloadButton').text('Cancel');
        var sleepTime = parseInt($('#sleepTimeInput').val());
        downloadPlaylistRecursive(playlist, sleepTime, 0);
    }
}

function downloadPlaylistRecursive(playlist, sleepTime, index) {
    if (playlist.length === 0 || !downloading) {
        downloading = false;
        $('#downloadButton').text('Download');
        return;
    }
    $.ajax({
        url: '/download-track', type: 'GET',
        data: { track: playlist[0], sleepTime: sleepTime },
        success: function (result) {
            var track = result.track;
            console.log('Downloaded ', track, track.lyrics != null, "#" + index);
            if (track.lyrics != null) {
                $("#" + index).css({ 'color': 'green' });
            } else {
                $("#" + index).css({ 'color': 'red' });
            }
            downloadPlaylistRecursive(playlist.slice(1), sleepTime, index + 1);
        }
    });
}
