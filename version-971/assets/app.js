(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var keyword = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var empty = document.querySelector(panel.getAttribute("data-empty-target"));
      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category")
          ].join(" "));
          var matchKeyword = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
          var matchType = !t || normalize(card.getAttribute("data-type")).indexOf(t) !== -1;
          var ok = matchKeyword && matchYear && matchType;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [keyword, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-category=\"" + escapeHtml(movie.category) + "\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-badge\">" + escapeHtml(movie.year || "热播") + "</span><span class=\"poster-mask\">立即观看</span></a>" +
      "<div class=\"movie-card-body\"><h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3><p class=\"movie-meta\">" + escapeHtml(movie.type) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.category) + "</p><p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[ch];
    });
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("site-search-input");
    var empty = document.getElementById("search-empty");
    if (!results || !input || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var q = normalize(input.value);
      var list = window.MOVIES.filter(function (movie) {
        var haystack = normalize([movie.title, movie.year, movie.type, movie.region, movie.genre, movie.category, movie.oneLine].join(" "));
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(movieCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", list.length === 0);
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
