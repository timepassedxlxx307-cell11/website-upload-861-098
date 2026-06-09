(function () {
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.hidden = !menu.hidden;
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function setupLocalFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!inputs.length || !cards.length) {
            return;
        }
        function apply(term) {
            var keyword = normalize(term);
            cards.forEach(function (card) {
                var content = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords"));
                card.classList.toggle("is-hidden", keyword && content.indexOf(keyword) === -1);
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
    }

    function setupTagFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".tag-filter"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!buttons.length || !cards.length) {
            return;
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var term = normalize(button.getAttribute("data-filter"));
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute("data-keywords"));
                    card.classList.toggle("is-hidden", term && content.indexOf(term) === -1);
                });
            });
        });
    }

    function renderResult(item) {
        return "<a class=\"search-result\" href=\"" + escapeHTML(item.url) + "\">" +
            "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\">" +
            "<span><strong>" + escapeHTML(item.title) + "</strong>" +
            "<span>" + escapeHTML([item.year, item.region, item.type, item.genre].filter(Boolean).join(" · ")) + "</span></span></a>";
    }

    function setupGlobalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search-input"));
        var data = window.SearchIndex || [];
        if (!inputs.length || !data.length) {
            return;
        }
        inputs.forEach(function (input) {
            var box = input.closest(".global-search");
            var panel = box ? box.querySelector(".global-search-panel") : null;
            if (!panel) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                if (!keyword) {
                    panel.hidden = true;
                    panel.innerHTML = "";
                    return;
                }
                var results = data.filter(function (item) {
                    return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags).indexOf(keyword) !== -1;
                }).slice(0, 12);
                panel.hidden = false;
                panel.innerHTML = results.length ? results.map(renderResult).join("") : "<div class=\"search-empty\">未找到相关影片</div>";
            });
            input.addEventListener("focus", function () {
                if (input.value.trim() && panel.innerHTML) {
                    panel.hidden = false;
                }
            });
        });
        document.addEventListener("click", function (event) {
            if (!event.target.closest(".global-search")) {
                document.querySelectorAll(".global-search-panel").forEach(function (panel) {
                    panel.hidden = true;
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupLocalFilter();
        setupTagFilters();
        setupGlobalSearch();
    });
}());
