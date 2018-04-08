function storeLyrics() {
    ajax('/lyrics', { lyrics: $('#lyrics-display').val() }, refreshPlaylist, 'POST');
}

function clearLyricsText(res) {
    $('#lyrics-display').val('');
    refreshPlaylist(res);
}

function removeLyrics() {
    ajax('/lyrics', {}, clearLyricsText, 'DELETE');
}

function playTrack(trackId, artist, title) {
    console.log("Playing track " + trackId);
    ajax('/play-track', { trackId: trackId });
    getLyrics(artist, title);
}

function customSearch(index, trackId, artist, title) {
    $('#dialog').attr('data-id', trackId);
    $('#dialog').attr('data-index', index);
    $('#custom-artist').val(artist);
    $('#custom-title').val(title);
    $("#dialog").dialog("open");
}

function updateLyrics(res) {
    $('#track-section').replaceWith(res.trackHtml);
    if ($('#collapseThree').attr('aria-expanded') !== "true")
        $('#collapseThree').collapse('show');
    if (res.title || res.artist)
        $('#lyricsHeader').text(res.artist + ' - ' + res.title);
}

function getLyrics(id, artist, title, site) {
    ajax('/lyrics', { artist: artist, title: title, id: id, site: site }, updateLyrics);
}