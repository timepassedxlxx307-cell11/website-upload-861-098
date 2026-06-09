import { H as Hls } from './hls-vendor-dru42stk.js';

function initializeMobileNavigation() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const navigation = document.querySelector('[data-mobile-nav]');

    if (!toggle || !navigation) {
        return;
    }

    toggle.addEventListener('click', () => {
        navigation.classList.toggle('is-open');
    });
}

function initializeHeroSlider() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
        return;
    }

    let currentIndex = 0;
    let timer = null;

    const showSlide = (nextIndex) => {
        currentIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === currentIndex);
        });
    };

    const start = () => {
        timer = window.setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5200);
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }

        start();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            restart();
        });
    });

    start();
}

function initializeImageFallbacks() {
    const images = document.querySelectorAll('.poster-frame img, .category-cover img, .detail-poster img, .ranking-poster img');

    images.forEach((image) => {
        image.addEventListener('error', () => {
            const frame = image.closest('.poster-frame, .category-cover, .detail-poster, .ranking-poster');

            if (frame) {
                frame.classList.add('poster-missing');
            }

            image.remove();
        }, { once: true });
    });
}

function initializePlayers() {
    const playerCards = document.querySelectorAll('[data-player]');

    playerCards.forEach((card) => {
        const video = card.querySelector('video');
        const button = card.querySelector('[data-play-button]');
        const videoUrl = card.getAttribute('data-video-url');
        let hlsInstance = null;
        let isPrepared = false;

        if (!video || !videoUrl) {
            return;
        }

        const prepareVideo = () => {
            if (isPrepared) {
                return Promise.resolve();
            }

            isPrepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                return Promise.resolve();
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);

                return new Promise((resolve) => {
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                        resolve();
                    });
                });
            }

            video.src = videoUrl;
            return Promise.resolve();
        };

        const playVideo = () => {
            prepareVideo().then(() => {
                if (button) {
                    button.classList.add('is-hidden');
                }

                const playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            });
        };

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', () => {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', () => {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function initializePageFilters() {
    const panel = document.querySelector('[data-page-filter]');
    const list = document.querySelector('[data-filter-list]');
    const count = document.querySelector('[data-result-count]');

    if (!panel || !list) {
        return;
    }

    const input = panel.querySelector('[data-filter-input]');
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const filters = {
        year: '',
        region: '',
        type: ''
    };

    const update = () => {
        const query = normalizeText(input ? input.value : '');
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = normalizeText([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));

            const matchesQuery = !query || haystack.includes(query);
            const matchesYear = !filters.year || card.getAttribute('data-year') === filters.year;
            const matchesRegion = !filters.region || card.getAttribute('data-region') === filters.region;
            const matchesType = !filters.type || card.getAttribute('data-type') === filters.type;
            const visible = matchesQuery && matchesYear && matchesRegion && matchesType;

            card.classList.toggle('is-hidden-by-filter', !visible);

            if (visible) {
                visibleCount += 1;
            }
        });

        if (count) {
            count.textContent = `${visibleCount} 部影片`;
        }
    };

    panel.querySelectorAll('[data-filter-chip]').forEach((chip) => {
        chip.addEventListener('click', () => {
            const key = chip.getAttribute('data-filter-chip');
            const value = chip.getAttribute('data-filter-value') || '';
            filters[key] = value;

            panel.querySelectorAll(`[data-filter-chip="${key}"]`).forEach((item) => {
                item.classList.toggle('is-active', item === chip);
            });

            update();
        });
    });

    panel.querySelectorAll('[data-chip-row]').forEach((row) => {
        const firstButton = row.querySelector('button');

        if (firstButton) {
            firstButton.classList.add('is-active');
        }
    });

    if (input) {
        input.addEventListener('input', update);
    }

    update();
}

function cardTemplate(movie) {
    const tags = Array.isArray(movie.tags) && movie.tags.length ? movie.tags.slice(0, 2).join(' / ') : movie.genre;

    return `
        <article class="movie-card">
            <a class="poster-frame" href="${movie.detail}" aria-label="观看 ${escapeHtml(movie.title)}">
                <img src="${movie.cover}" alt="${escapeHtml(movie.title)} 封面" loading="lazy">
                <span class="play-cue">播放</span>
            </a>
            <div class="movie-card-body">
                <a class="movie-card-title" href="${movie.detail}">${escapeHtml(movie.title)}</a>
                <p class="movie-card-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
                <p class="movie-card-desc">${escapeHtml(movie.oneLine)}</p>
                <div class="card-bottom">
                    <span>${escapeHtml(tags)}</span>
                    <a href="${movie.categoryUrl}">${escapeHtml(movie.category)}</a>
                </div>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function initializeSearchPage() {
    const page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIES) {
        return;
    }

    const form = page.querySelector('[data-search-form]');
    const input = page.querySelector('[data-search-input]');
    const results = page.querySelector('[data-search-results]');
    const meta = page.querySelector('[data-search-meta]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    const render = (query) => {
        const normalizedQuery = normalizeText(query);

        if (!normalizedQuery) {
            results.innerHTML = '';
            meta.textContent = '请输入关键词开始搜索。';
            return;
        }

        const matched = window.MOVIES.filter((movie) => {
            const haystack = normalizeText([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
            ].join(' '));

            return haystack.includes(normalizedQuery);
        }).slice(0, 180);

        meta.textContent = `找到 ${matched.length} 条相关结果${matched.length === 180 ? '，已展示前 180 条' : ''}。`;
        results.innerHTML = matched.map(cardTemplate).join('');
        initializeImageFallbacks();
    };

    if (input) {
        input.value = initialQuery;
    }

    render(initialQuery);

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = input ? input.value : '';
            const url = new URL(window.location.href);
            url.searchParams.set('q', query);
            window.history.replaceState({}, '', url.toString());
            render(query);
        });
    }

    if (input) {
        input.addEventListener('input', () => {
            render(input.value);
        });
    }
}

initializeMobileNavigation();
initializeHeroSlider();
initializeImageFallbacks();
initializePlayers();
initializePageFilters();
initializeSearchPage();
