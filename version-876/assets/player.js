(function () {
  function preparePlayer(block) {
    const video = block.querySelector('video');
    const cover = block.querySelector('.video-cover');
    const url = block.getAttribute('data-hls');
    let hls = null;
    let ready = false;

    function bindVideo() {
      if (ready || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = url;
      ready = true;
    }

    function start() {
      bindVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (!ready) {
          start();
          return;
        }
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(preparePlayer);
}());
