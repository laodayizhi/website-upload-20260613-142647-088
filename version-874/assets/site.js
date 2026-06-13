(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

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

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupSearch(form) {
        var input = form.querySelector('[data-search-input]');
        var panel = form.querySelector('[data-search-panel]');
        var data = Array.isArray(globalThis.SITE_SEARCH_DATA) ? globalThis.SITE_SEARCH_DATA : [];

        if (!input || !panel || !data.length) {
            return;
        }

        function closePanel() {
            panel.classList.remove('is-open');
        }

        function renderResults() {
            var keyword = normalize(input.value);

            if (!keyword) {
                closePanel();
                panel.innerHTML = '';
                return;
            }

            var results = data.filter(function (item) {
                return normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre
                ].join(' ')).indexOf(keyword) !== -1;
            }).slice(0, 12);

            panel.innerHTML = results.map(function (item) {
                return '<a class="search-item" href="' + item.link + '">' +
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                    '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
                    '</a>';
            }).join('');

            panel.classList.toggle('is-open', results.length > 0);
        }

        input.addEventListener('input', renderResults);
        input.addEventListener('focus', renderResults);

        form.addEventListener('submit', function (event) {
            var keyword = normalize(input.value);
            var exact = data.find(function (item) {
                return normalize(item.title) === keyword;
            });

            if (exact) {
                event.preventDefault();
                window.location.href = exact.link;
            }
        });

        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                closePanel();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(setupSearch);

    function setupFilters() {
        var list = document.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var input = document.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var filters = {};

            selects.forEach(function (select) {
                filters[select.getAttribute('data-filter-select')] = normalize(select.value);
            });

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));

                var visible = !keyword || text.indexOf(keyword) !== -1;

                Object.keys(filters).forEach(function (key) {
                    if (!filters[key]) {
                        return;
                    }

                    var value = normalize(card.getAttribute('data-' + key));

                    if (value.indexOf(filters[key]) === -1) {
                        visible = false;
                    }
                });

                card.classList.toggle('is-hidden', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
    }

    setupFilters();

    function setupPlayer() {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-play-button]');

        if (!shell || !video || !button) {
            return;
        }

        var ready = false;
        var hlsInstance = null;
        var streamUrl = video.getAttribute('data-video');

        function prepareVideo() {
            if (ready || !streamUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
                hlsInstance = new globalThis.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            ready = true;
        }

        function playVideo() {
            prepareVideo();
            button.classList.add('is-hidden');
            video.play().catch(function () {
                button.classList.remove('is-hidden');
            });
        }

        button.addEventListener('click', function (event) {
            event.preventDefault();
            playVideo();
        });

        shell.addEventListener('click', function (event) {
            if (event.target === video || event.target === shell) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.currentTime) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupPlayer();
}());
