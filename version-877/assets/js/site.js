(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                startHero();
            });
        });

        showSlide(0);
        startHero();

        Array.prototype.slice.call(document.querySelectorAll('[data-local-search]')).forEach(function (input) {
            var targetSelector = input.getAttribute('data-local-search');
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            var empty = document.querySelector('[data-result-empty]');

            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var value = card.getAttribute('data-search-value') || card.textContent || '';
                    var isVisible = !keyword || value.toLowerCase().indexOf(keyword) !== -1;
                    card.style.display = isVisible ? '' : 'none';
                    if (isVisible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visibleCount ? 'none' : 'block';
                }
            });
        });

        var searchInput = document.querySelector('[data-search-input]');
        var searchType = document.querySelector('[data-search-type]');
        var searchGrid = document.querySelector('[data-search-grid]');

        function renderSearch() {
            if (!searchInput || !searchGrid || !window.SEARCH_ITEMS) {
                return;
            }

            var keyword = searchInput.value.trim().toLowerCase();
            var typeValue = searchType ? searchType.value : '';
            var items = window.SEARCH_ITEMS.filter(function (item) {
                var text = [item.title, item.year, item.region, item.type, item.genre, item.category, item.tags].join(' ').toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !typeValue || item.type.indexOf(typeValue) !== -1 || item.genre.indexOf(typeValue) !== -1;
                return matchedKeyword && matchedType;
            }).slice(0, 120);

            searchGrid.innerHTML = items.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '    <a class="movie-cover" href="' + item.url + '">',
                    '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                    '        <span class="movie-badge">' + item.year + '</span>',
                    '    </a>',
                    '    <div class="movie-body">',
                    '        <h2 class="movie-title"><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                    '        <div class="movie-info"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                    '        <p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
                    '    </div>',
                    '</article>'
                ].join('\n');
            }).join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        if (searchInput && searchGrid) {
            searchInput.addEventListener('input', renderSearch);
            if (searchType) {
                searchType.addEventListener('change', renderSearch);
            }
            renderSearch();
        }
    });
})();
