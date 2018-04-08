﻿function initDialog() {
    $("#dialog").dialog({
        autoOpen: false,
        width: 600,
        buttons: {
            Ok: function () {
                var id = $('#dialog').attr('data-id');
                var index = $('#dialog').attr('data-index');
                var artist = $('#custom-artist').val();
                var title = $('#custom-title').val();
                ajax('/download-track', { track: { artist: artist, title: title, id: id } }, updateDownloadStatus([], null, index));
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}

$(document).ready(function () {
    $("#collapseTwo").collapse();
    var playlistLinks = $('#playlist-link:first');

    initDialog();

    if (playlistLinks != null) {
        playlistLinks.trigger('click');
    }

    setInterval(function () {
        console.log('Refreshing token');
        ajax('/refreshToken',
            {},
            function (res) {
                console.log('New access token ' + res.accessToken);
                $('#main-divider').attr('data-access-token', res.accessToken);
            });
    }, 1000 * 3600);
});