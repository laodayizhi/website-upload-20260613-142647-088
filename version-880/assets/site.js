(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-nav");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var heroForm = document.querySelector("[data-role='hero-search']");

    if (heroForm) {
      heroForm.addEventListener("submit", function (event) {
        var input = heroForm.querySelector("input");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "categories.html?q=" + encodeURIComponent(input.value.trim());
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-keywords]"));
    var searchInput = document.querySelector("[data-role='search-input']");
    var typeSelect = document.querySelector("[data-role='type-select']");
    var regionSelect = document.querySelector("[data-role='region-select']");
    var yearSelect = document.querySelector("[data-role='year-select']");
    var genreSelect = document.querySelector("[data-role='genre-select']");

    if (cards.length && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        searchInput.value = query;
      }

      function applyFilters() {
        var keyword = normalize(searchInput.value);
        var typeValue = typeSelect ? typeSelect.value : "";
        var regionValue = regionSelect ? regionSelect.value : "";
        var yearValue = yearSelect ? yearSelect.value : "";
        var genreValue = genreSelect ? normalize(genreSelect.value) : "";

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords"));
          var typeOk = !typeValue || card.getAttribute("data-type") === typeValue;
          var regionOk = !regionValue || card.getAttribute("data-region") === regionValue;
          var yearOk = !yearValue || card.getAttribute("data-year") === yearValue;
          var genreOk = !genreValue || normalize(card.getAttribute("data-genre")).indexOf(genreValue) > -1;
          var keywordOk = !keyword || text.indexOf(keyword) > -1;
          card.classList.toggle("is-filter-hidden", !(typeOk && regionOk && yearOk && genreOk && keywordOk));
        });
      }

      [searchInput, typeSelect, regionSelect, yearSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
