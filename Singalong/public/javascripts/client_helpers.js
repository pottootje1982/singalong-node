var downloading = false;

function downloadPlaylist() {
    if (downloading) {
        downloading = false;
    } else {
        $.ajax({
            url: '/textual-playlist-to-playlist', type: 'POST',
            data: { playlist: $('#playlistText').val() },
            success: function(res) {
                $('#playlist').html(res.playlistHtml);

                downloading = true;
                $('#downloadButton').text('Cancel');
                var sleepTime = parseInt($('#sleepTimeInput').val());
                downloadPlaylistRecursive(res.playlist, sleepTime, 0);
            }
        });
    }
}

function downloadPlaylistRecursive(playlist, sleepTime, index) {
    if (playlist.length === 0 || !downloading) {
        downloading = false;
        $('#downloadButton').text('Download');
        return;
    }

    $("#" + index).css({ 'color': 'orange' });

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
