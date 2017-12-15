var lastTrack;

$(document).ready(function () {
    console.log("ready!");
    setInterval(function() {
            $.ajax({
                url: '/current-track',
                success: function (res) {
                    var track = res.trackName;
                    if (lastTrack !== track) {
                        var header = $('h2:contains("' + track + '")');
                        console.log(track, lastTrack, header);
                        if (header != null && header.offset() != null) {
                            $('html, body').animate({
                                scrollTop: header.offset().top
                            }, 200);
                        }
                    }
                    lastTrack = track;
                }
            });
        },
        1000);
});