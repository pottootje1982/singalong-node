function getSelectedTrack() {
    return {
        artist: $('#lyrics-display').attr('data-artist'),
        title: $('#lyrics-display').attr('data-title')
    };
}

function showError(res) {
    if (res.responseText)
        $('#alert-message').replaceWith(res && res.responseText);
    else
        $('#alert-message').text(res && res.responseJSON ? res.responseJSON.error : res.statusText);
    $('#alert-section').css('display', 'block');
    window.setTimeout(() => {
        $('#alert-section').css('display', 'none');
    }, 10000);
}

function getSelectedPlaylist() {
    return {
        context: {
            userId: $('#playlist').attr('data-user-id'),
            playlistId: $('#playlist').attr('data-playlist'),
            albumId: $('#playlist').attr('data-album-id')
        }
    };
}

function getTokens() {
    return {
        accessToken: $('#main-divider').attr('data-access-token'),
        refreshToken: $('#main-divider').attr('data-refresh-token')
    };
}

function getContext(addedContext) {
    var data = getSelectedPlaylist();
    var selTrack = getSelectedTrack();
    $.extend(data, selTrack);
    $.extend(data, getTokens());
    $.extend(data, addedContext);
    return data;
}

function ajax(url, addedContext, success, type) {
    var data = getContext(addedContext);
    var queryString = type ? '?' + $.param(data) : '';
    data = type ? addedContext : data;
    $.ajax({
        url: url + queryString, type: type,
        data: data,
        context: data,
        success: success,
        error: showError
    });
}