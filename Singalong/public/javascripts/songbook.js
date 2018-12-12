var lastTrackId;

function setCurrentTrack(res) {
    setTrackSliderPosition(res);
    window.location.href = '#' + res.id;
}

function prevTrack() {
    ajax('/skip-to-track', {withLyrics: true}, setCurrentTrack);
}

function nextTrack() {
    ajax('/skip-to-track', {next: true, withLyrics: true }, setCurrentTrack);
}

$(document).ready(function () {
    var playlistName = $('#playlist').attr('data-playlist-name');
    window.history.pushState("", "", '/songbook/' + encodeURIComponent(playlistName));
});