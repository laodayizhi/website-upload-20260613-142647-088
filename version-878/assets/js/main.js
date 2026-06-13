(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupLocalFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var section = panel.parentElement;
            var list = section ? section.querySelector("[data-filter-list]") : null;
            var empty = section ? section.querySelector("[data-empty-state]") : null;
            var input = panel.querySelector("[data-filter-input]");
            var selects = panel.querySelectorAll("[data-filter-select]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            function apply() {
                var text = normalize(input ? input.value : "");
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter-select")] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matched = !text || haystack.indexOf(text) !== -1;
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                            matched = false;
                        }
                    });
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("active", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"card-cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"card-year\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"card-play\">▶</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.desc) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        var count = document.querySelector("[data-search-count]");
        var input = document.querySelector("#search-page-input");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get("q") || "");
        if (input) {
            input.value = params.get("q") || "";
        }
        if (!query) {
            if (count) {
                count.textContent = "";
            }
            return;
        }
        var matched = window.SEARCH_INDEX.filter(function (movie) {
            return normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.desc,
                (movie.tags || []).join(" ")
            ].join(" ")).indexOf(query) !== -1;
        }).slice(0, 120);
        results.innerHTML = matched.map(cardTemplate).join("");
        if (empty) {
            empty.classList.toggle("active", matched.length === 0);
            if (matched.length === 0) {
                empty.textContent = "没有找到匹配内容";
            }
        }
        if (count) {
            count.textContent = matched.length ? "已显示相关内容" : "";
        }
    }

    ready(function () {
        setupNavigation();
        setupLocalFilters();
        setupSearchPage();
    });
})();
