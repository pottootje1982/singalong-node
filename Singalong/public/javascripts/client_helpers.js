var downloading = false;

function downloadPlaylist() {
    if (downloading) {
        downloading = false;
    } else {
        $.ajax({
            url: '/textual-playlist-to-playlist', type: 'GET',
            data: { playlist: $('#playlistText').val() },
            dataType: "json",
            success: function(res) {
                $('#playlist').html(res.playlistHtml);

                downloading = true;
                $('#downloadButton').text('Cancel');
                var sleepTime = parseInt($('#sleepTimeInput').val());
                downloadPlaylistRecursive(res.playlist, sleepTime, 0);
            },
            error: function (xhr, exception) { alert("An error occured when getting playlist: " + xhr.status + " " + xhr.statusText + '\n' + exception);}
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
        contentType: "application/json", dataType: "json",
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
