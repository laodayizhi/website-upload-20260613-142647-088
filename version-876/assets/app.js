(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const opened = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    const items = Array.from(document.querySelectorAll('[data-item]'));
    localFilter.addEventListener('input', function () {
      const query = localFilter.value.trim().toLowerCase();
      items.forEach(function (item) {
        const haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-region'),
          item.getAttribute('data-year')
        ].join(' ').toLowerCase();
        item.classList.toggle('is-filtered-out', query && haystack.indexOf(query) === -1);
      });
    });
  }

  const searchForm = document.querySelector('[data-search-form]');
  const searchResults = document.querySelector('[data-search-results]');

  function createSearchCard(item) {
    const article = document.createElement('article');
    article.className = 'movie-card';

    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = item.url;

    const figure = document.createElement('figure');
    figure.className = 'poster-frame';

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.title;
    image.loading = 'lazy';

    const caption = document.createElement('figcaption');
    caption.textContent = '⭐ ' + item.score;

    const body = document.createElement('div');
    body.className = 'movie-card-body';

    const title = document.createElement('h2');
    title.textContent = item.title;

    const text = document.createElement('p');
    text.textContent = item.oneLine;

    const meta = document.createElement('div');
    meta.className = 'movie-card-meta';

    const year = document.createElement('span');
    year.textContent = item.year;

    const region = document.createElement('span');
    region.textContent = item.region;

    meta.appendChild(year);
    meta.appendChild(region);
    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(meta);
    figure.appendChild(image);
    figure.appendChild(caption);
    link.appendChild(figure);
    link.appendChild(body);
    article.appendChild(link);
    return article;
  }

  if (searchForm && searchResults && Array.isArray(window.SEARCH_ITEMS)) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = searchForm.querySelector('input[name="q"]');
      const query = input ? input.value.trim().toLowerCase() : '';
      searchResults.textContent = '';

      if (!query) {
        return;
      }

      const matched = window.SEARCH_ITEMS.filter(function (item) {
        return [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 36);

      if (!matched.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配影片，换个关键词再试试。';
        searchResults.appendChild(empty);
        return;
      }

      matched.forEach(function (item) {
        searchResults.appendChild(createSearchCard(item));
      });
    });
  }
}());
