(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var previous = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector(".movie-search");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
    var run = function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-filtered-out", value && text.indexOf(value) === -1);
      });
    };
    input.addEventListener("input", run);
    run();
  }

  function setupPlayer(sourceUrl) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    var toggle = document.getElementById("player-toggle");
    var mute = document.getElementById("player-mute");
    var full = document.getElementById("player-fullscreen");
    var controls = document.getElementById("player-controls");
    var errorBox = document.getElementById("player-error");
    var attached = false;
    var hls = null;
    var wantsPlay = false;

    if (!video || !sourceUrl) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.textContent = "播放暂时不可用，请稍后重试";
        errorBox.classList.add("is-visible");
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (wantsPlay) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showError();
        });
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      showError();
    }

    function updateButtons() {
      var label = video.paused ? "▶" : "❚❚";
      if (toggle) {
        toggle.textContent = label;
      }
      if (controls) {
        controls.classList.toggle("is-visible", !video.paused);
      }
    }

    function play() {
      wantsPlay = true;
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.play().catch(function () {
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 450);
      });
      updateButtons();
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
      updateButtons();
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updateButtons);
    video.addEventListener("pause", updateButtons);

    if (toggle) {
      toggle.addEventListener("click", togglePlay);
    }
    if (mute) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "🔇" : "🔊";
      });
    }
    if (full) {
      full.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          return;
        }
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
    updateButtons();
  }

  window.initializeMoviePlayer = setupPlayer;

  ready(function () {
    setupMobileNav();
    setupHeroCarousel();
    setupSearch();
  });
})();
