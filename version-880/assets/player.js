(function () {
  window.setupPlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = streamUrl;
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
            }
          });
        }
        return;
      }

      if (!video.src) {
        video.src = streamUrl;
      }
    }

    function startPlay() {
      bindStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    bindStream();

    if (cover) {
      cover.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  };
})();
