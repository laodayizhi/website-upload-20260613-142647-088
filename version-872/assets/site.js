(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var filterForm = document.querySelector("[data-filter-form]");

    if (filterForm) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        var searchInput = filterForm.querySelector("[data-filter-search]");
        var regionSelect = filterForm.querySelector("[data-filter-region]");
        var typeSelect = filterForm.querySelector("[data-filter-type]");
        var yearSelect = filterForm.querySelector("[data-filter-year]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" "));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || normalize(card.dataset.region) === region;
                var matchType = !type || normalize(card.dataset.type) === type;
                var matchYear = !year || normalize(card.dataset.year) === year;
                card.classList.toggle("hidden-by-filter", !(matchKeyword && matchRegion && matchType && matchYear));
            });
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", applyFilter);
                node.addEventListener("change", applyFilter);
            }
        });

        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });
    }

    var searchInput = document.getElementById("searchPageInput");
    var searchResults = document.getElementById("searchResults");
    var searchForm = document.getElementById("searchPageForm");

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function resultTemplate(item) {
        return "<article class="result-card">" +
            "<a href="./" + escapeHtml(item.file) + ""><img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy"></a>" +
            "<div><h3><a href="./" + escapeHtml(item.file) + "">" + escapeHtml(item.title) + "</a></h3>" +
            "<p>" + escapeHtml(item.one_line) + "</p>" +
            "<div class="result-meta"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.genre) + "</span></div></div>" +
            "</article>";
    }

    function runSearch() {
        if (!searchInput || !searchResults || !Array.isArray(window.SEARCH_INDEX)) {
            return;
        }
        var query = String(searchInput.value || "").trim().toLowerCase();
        var data = window.SEARCH_INDEX;
        var results = query ? data.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.one_line, (item.tags || []).join(" ")]
                .join(" ")
                .toLowerCase()
                .indexOf(query) !== -1;
        }) : data.slice(0, 36);
        var limited = results.slice(0, 80);
        searchResults.innerHTML = limited.length ? limited.map(resultTemplate).join("") : "<div class="empty-message">没有找到匹配内容，可以换一个关键词继续搜索。</div>";
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;
        runSearch();
        searchInput.addEventListener("input", runSearch);
        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                runSearch();
            });
        }
    }
})();
