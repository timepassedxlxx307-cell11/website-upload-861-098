(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });

        play();
    }

    function numericYear(value) {
        var match = String(value || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var select = document.querySelector('[data-sort-select]');
        var container = document.querySelector('[data-card-container]');
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (input && q) {
            input.value = q;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
                card.hidden = keyword && haystack.indexOf(keyword) === -1;
            });
        }

        function applySort() {
            if (!select) {
                return;
            }
            var value = select.value;
            var sorted = cards.slice();
            if (value === 'year-desc') {
                sorted.sort(function (a, b) {
                    return numericYear(b.getAttribute('data-year')) - numericYear(a.getAttribute('data-year'));
                });
            } else if (value === 'year-asc') {
                sorted.sort(function (a, b) {
                    return numericYear(a.getAttribute('data-year')) - numericYear(b.getAttribute('data-year'));
                });
            } else if (value === 'title-asc') {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', function () {
                applySort();
                applyFilter();
            });
        }
        applySort();
        applyFilter();
    }

    function startPlayer(button) {
        var video = document.getElementById(button.getAttribute('data-video'));
        var url = button.getAttribute('data-stream');
        if (!video || !url) {
            return;
        }
        var shell = button.closest('[data-player]');
        if (shell && shell.getAttribute('data-playing') === 'true') {
            video.play().catch(function () {});
            return;
        }
        if (shell) {
            shell.setAttribute('data-playing', 'true');
        }
        button.classList.add('is-hidden');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = url;
            video.play().catch(function () {});
        }
    }

    function initPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.player-button'));
        buttons.forEach(function (button) {
            var shell = button.closest('[data-player]');
            var video = document.getElementById(button.getAttribute('data-video'));
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(button);
            });
            if (shell) {
                shell.addEventListener('click', function (event) {
                    if (shell.getAttribute('data-playing') !== 'true') {
                        event.preventDefault();
                        startPlayer(button);
                    }
                });
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (shell) {
                        shell.setAttribute('data-playing', 'true');
                    }
                    button.classList.add('is-hidden');
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
