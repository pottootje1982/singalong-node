var is_playing = false

function pad(number, length) {
  number = Math.floor(number)
  var str = "" + number.toFixed(0)
  while (str.length < length) {
    str = "0" + str
  }

  return str
}

function setTrackSliderPosition(res) {
  if (!res) return
  is_playing = res.is_playing
  var backIcon = is_playing ? "url(pause.png)" : "url(play.png)"
  console.log("Currently playing: ", res.artist, res.title, res.progress_ms)
  $("#toggle-play-button").css("background-image", backIcon)
  if (res.duration_ms)
    $("#track-slider").attr("max", res.duration_ms.toFixed(0))
  if (res.progress_ms != null) $("#track-slider").val(res.progress_ms)
}

function setTime(pos) {
  var seconds = pos / 1000
  var minutes = pad(seconds / 60, 2)
  seconds = pad(seconds - minutes * 60, 2)
  $("#timer").text(minutes + ":" + seconds)
  $("#track-slider").val(pos)
}

function togglePlay() {
  if (is_playing) ajax("/toggle-play", {}, setCurrentTrack)
  else ajax("/toggle-play", { play: true }, setCurrentTrack)
}

function getCurrentTrack() {
  ajax("/current-track", {}, setCurrentTrack)
}

var interval = 1000
$(document).ready(function() {
  setInterval(function() {
    var pos = parseInt($("#track-slider").val())
    var max = parseInt($("#track-slider").attr("max"))
    if (pos == max) {
      console.log("skipping to next")
      ajax("/current-track", {}, setCurrentTrack)
    } else if (is_playing) {
      setTime(pos + interval)
    }
  }, interval)
})
