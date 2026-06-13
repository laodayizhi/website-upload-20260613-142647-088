function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
    return;
  }

  callback();
}

function initMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function initHero() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var prev = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initSearch(inputId, resultsId) {
  var input = document.getElementById(inputId);
  var results = document.getElementById(resultsId);
  var data = window.SEARCH_MOVIES || [];

  if (!input || !results || !data.length) {
    return;
  }

  function closeResults() {
    results.classList.remove('open');
    results.innerHTML = '';
  }

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();

    if (!query) {
      closeResults();
      return;
    }

    var matches = data.filter(function (item) {
      return [item.title, item.year, item.region, item.genre, item.type]
        .join(' ')
        .toLowerCase()
        .indexOf(query) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      results.classList.add('open');
      results.innerHTML = '<div class="search-result-item"><div></div><div><strong>暂无匹配内容</strong><span>可尝试输入其他片名、年份或题材</span></div></div>';
      return;
    }

    results.classList.add('open');
    results.innerHTML = matches.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<div><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span></div>' +
        '</a>';
    }).join('');
  });

  document.addEventListener('click', function (event) {
    if (!results.contains(event.target) && event.target !== input) {
      closeResults();
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initGlobalSearches() {
  initSearch('global-search', 'global-search-results');
  initSearch('category-global-search', 'category-global-search-results');
  initSearch('ranking-search', 'ranking-search-results');
}

function initCardFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var search = panel.querySelector('[data-card-search]');
    var year = panel.querySelector('[data-year-filter]');
    var genre = panel.querySelector('[data-genre-filter]');
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedGenre = genre ? genre.value.toLowerCase() : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var visible = true;

        if (q && haystack.indexOf(q) === -1) {
          visible = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          visible = false;
        }

        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          visible = false;
        }

        card.style.display = visible ? '' : 'none';
      });
    }

    [search, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
}

function initPlayer(streamUrl) {
  var video = document.getElementById('video-player');
  var cover = document.querySelector('[data-play-cover]');

  if (!video || !streamUrl) {
    return;
  }

  function loadVideo() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function begin() {
    loadVideo().then(function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  if (cover) {
    cover.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });
}

ready(function () {
  initMenu();
  initHero();
  initGlobalSearches();
  initCardFilters();
});
