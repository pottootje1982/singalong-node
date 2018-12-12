var is_playing = false;

function setTrackSliderPosition(res) {
    is_playing = res.is_playing;
    console.log('Currently playing: ', res.artist, res.title, res.progress_ms)
    $('#track-slider').attr('max', (res.duration_ms / 1000).toFixed(0));
    $('#track-slider').val(res.progress_ms / 1000);
}

$(document).ready(function () {
    setInterval(function() {
        var pos = parseInt($('#track-slider').val());
        var max = parseInt($('#track-slider').attr('max'));
        if (pos == max) {
            console.log('skipping to next')
            ajax('/current-track', {}, setCurrentTrack)
        }
        else if (is_playing) {
            $('#track-slider').val(pos + 1);
        }
        
    },
    1000);
});