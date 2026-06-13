(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        schedule();
      });
    });
    schedule();
  }

  function initCardFilter() {
    var input = document.querySelector('.card-filter');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.category-list .movie-card'));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  }

  function getBasePrefix() {
    var scripts = document.querySelectorAll('script[src$="assets/app.js"]');
    if (!scripts.length) return './';
    var src = scripts[scripts.length - 1].getAttribute('src') || '';
    return src.replace('assets/app.js', '');
  }

  function cardHtml(item, prefix) {
    return '' +
      '<a class="movie-card" href="' + prefix + item.url + '" data-title="' + escapeHtml(item.title) + '" data-tags="' + escapeHtml(item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags) + '">' +
      '<div class="poster-wrap"><img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="play-badge">播放</span></div>' +
      '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<div class="tag-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div></a>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    if (!results || !window.MOVIE_SEARCH_INDEX) return;
    var input = document.getElementById('search-page-input');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) input.value = query;
    render(query);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    function render(value) {
      var q = String(value || '').trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        return;
      }
      var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 120);
      if (!items.length) {
        results.innerHTML = '<div class="panel-card text-page"><p>暂未匹配到相关影片。</p></div>';
        return;
      }
      var prefix = getBasePrefix();
      results.innerHTML = items.map(function (item) {
        return cardHtml(item, prefix);
      }).join('');
    }
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var poster = player.querySelector('.player-poster');
      if (!video) return;
      function activate() {
        var src = video.getAttribute('data-src');
        if (!src) return;
        player.classList.add('is-playing');
        if (video.getAttribute('data-ready') === src) {
          video.play().catch(function () {});
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.setAttribute('data-ready', src);
          video.load();
          video.play().catch(function () {});
          return;
        }
        loadHlsScript(function () {
          if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
              video._hlsInstance.destroy();
            }
            var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            video._hlsInstance = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.setAttribute('data-ready', src);
              video.play().catch(function () {});
            });
          } else {
            video.src = src;
            video.setAttribute('data-ready', src);
            video.load();
            video.play().catch(function () {});
          }
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video && video.getAttribute('data-ready')) return;
        if (event.target.closest('.player-poster') || event.target.closest('.player-button') || event.target === player) {
          activate();
        }
      });
      if (poster) {
        poster.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
          }
        });
      }
    });
  }

  function initBackTop() {
    Array.prototype.slice.call(document.querySelectorAll('.back-top')).forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
    initPlayers();
    initBackTop();
  });
})();
