(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
            if (!slides.length) {
                return;
            }
            var current = 0;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        });

        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            var section = root.parentElement || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var input = root.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
            var currentKind = "全部";
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-index-text") || "").toLowerCase();
                    var kind = card.getAttribute("data-kind") || "";
                    var kindOk = currentKind === "全部" || kind === currentKind || haystack.indexOf(currentKind.toLowerCase()) !== -1;
                    var queryOk = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle("is-hidden", !(kindOk && queryOk));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    currentKind = button.getAttribute("data-filter-value") || "全部";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-player-start]");
            var url = player.getAttribute("data-video-src") || "";
            var attached = false;
            var instance = null;

            function attach() {
                if (attached || !video || !url) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    instance.loadSource(url);
                    instance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function start() {
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (video) {
                    video.setAttribute("controls", "controls");
                    var attempt = video.play();
                    if (attempt && attempt.catch) {
                        attempt.catch(function () {});
                    }
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!attached || video.paused) {
                        start();
                    }
                });
                video.addEventListener("ended", function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (instance && instance.destroy) {
                    instance.destroy();
                }
            });
        });
    });
})();
