var lastTrackId;

$(document).ready(function () {
    var playlistName = $('#playlist').attr('data-playlist-name');
    console.log("ready!", playlistName);
    window.history.pushState("", "", '/songbook/' + encodeURIComponent(playlistName));
    setInterval(function() {
        ajax('/current-track', {}, function (res) {
            var trackId = res.trackId;
            var trackName = res.trackName;
            if (lastTrackId !== trackId) {
                var header = trackId && $('#' + trackId) || '';
                if (header.length === 0)
                    header = $('h1:contains("' + trackName + '")');
                console.log(trackId, lastTrackId, header);
                if (header !== null && header.offset() !== null) {
                    $('html, body').animate({
                        scrollTop: header.offset().top
                    }, 200);
                }
            }
            lastTrackId = trackId;
        });
    },
    1000);
});