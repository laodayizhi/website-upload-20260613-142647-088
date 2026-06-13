(function() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function initFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function(scope) {
      var form = scope.querySelector('[data-filter-form]');
      if (!form) {
        return;
      }
      var q = form.querySelector('input[name="q"]');
      var year = form.querySelector('select[name="year"]');
      var region = form.querySelector('select[name="region"]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var apply = function() {
        var query = normalize(q && q.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var passQuery = !query || haystack.indexOf(query) !== -1;
          var passYear = !yearValue || cardYear === yearValue;
          var passRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
          card.classList.toggle('is-hidden', !(passQuery && passYear && passRegion));
        });
      };
      ['input', 'change'].forEach(function(eventName) {
        form.addEventListener(eventName, apply);
      });
    });
  }

  ready(function() {
    initMenu();
    initFilters();
  });
})();

function setupPlayer(src) {
  var video = document.getElementById('movieVideo');
  var overlay = document.querySelector('[data-play-overlay]');
  if (!video || !overlay || !src) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        capLevelToPlayerSize: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    attach();
    overlay.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (!loaded) {
      start();
      return;
    }
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function() {
    overlay.classList.add('is-hidden');
  });
  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
