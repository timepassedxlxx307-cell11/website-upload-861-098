(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector(".hero-slider");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        };

        var start = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    panels.forEach(function (panel) {
        var list = document.querySelector(".js-filter-list");
        var keywordInput = panel.querySelector(".js-filter-keyword");
        var categorySelect = panel.querySelector(".js-filter-category");
        var yearSelect = panel.querySelector(".js-filter-year");
        var sortSelect = panel.querySelector(".js-sort-mode");

        if (!list || !keywordInput) {
            return;
        }

        var items = Array.prototype.slice.call(list.querySelectorAll(".filter-item"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            keywordInput.value = query;
        }

        var normalize = function (value) {
            return String(value || "").trim().toLowerCase();
        };

        var apply = function () {
            var keyword = normalize(keywordInput.value);
            var category = categorySelect ? normalize(categorySelect.value) : "";
            var year = yearSelect ? normalize(yearSelect.value) : "";

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-category")
                ].join(" "));
                var itemCategory = normalize(item.getAttribute("data-category"));
                var itemYear = normalize(item.getAttribute("data-year"));
                var visible = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    visible = false;
                }

                if (category && itemCategory !== category) {
                    visible = false;
                }

                if (year && itemYear !== year) {
                    visible = false;
                }

                item.classList.toggle("is-hidden", !visible);
            });
        };

        var sortItems = function () {
            if (!sortSelect) {
                return;
            }

            var mode = sortSelect.value;
            var sorted = items.slice();

            if (mode === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            }

            if (mode === "title-asc") {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            }

            if (mode === "default") {
                sorted = items.slice();
            }

            sorted.forEach(function (item) {
                list.appendChild(item);
            });
        };

        [keywordInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener("change", function () {
                sortItems();
                apply();
            });
        }

        apply();
    });
})();
