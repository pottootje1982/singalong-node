function setTrackSliderPosition(res) {
    console.log('Currently playing: ', res.artist, res.title)
    $('#track-slider').attr('max', (res.duration_ms / 1000).toFixed(0));
    $('#track-slider').val(0);
}

$(document).ready(function () {
    setInterval(function() {
        var pos = parseInt($('#track-slider').val());
        var max = parseInt($('#track-slider').attr('max'));
        if (pos == max) {
            console.log('skipping to next')
            ajax('/current-track', {}, setCurrentTrack)
        }
        else {
            $('#track-slider').val(pos + 1);
        }
        
    },
    1000);
});