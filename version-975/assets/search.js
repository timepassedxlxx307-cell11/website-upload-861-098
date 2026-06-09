(function () {
    const movies = window.SEARCH_MOVIES || [];
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('q') || '').trim();
    const input = document.getElementById('search-input');
    const title = document.getElementById('search-title');
    const container = document.getElementById('search-results');

    if (input) {
        input.value = keyword;
    }

    function card(movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">'
            + '<a href="./' + encodeURIComponent(movie.url).replace(/%2F/g, '/') + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">'
            + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
            + '<span class="poster-region">' + escapeHtml(movie.region) + '</span>'
            + '<span class="poster-year">' + escapeHtml(movie.year) + '</span>'
            + '<span class="poster-play">▶</span>'
            + '</a>'
            + '<div class="movie-card-body">'
            + '<h3><a href="./' + encodeURIComponent(movie.url).replace(/%2F/g, '/') + '">' + escapeHtml(movie.title) + '</a></h3>'
            + '<p class="movie-meta">' + escapeHtml(movie.genre) + '</p>'
            + '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>'
            + '<div class="tag-list">' + tags + '</div>'
            + '</div>'
            + '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function matches(movie, words) {
        const source = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            movie.oneLine,
            (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return words.every(function (word) {
            return source.indexOf(word) !== -1;
        });
    }

    const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
    const results = words.length ? movies.filter(function (movie) {
        return matches(movie, words);
    }) : movies.slice(0, 60);

    if (title) {
        title.textContent = words.length ? '搜索结果：' + keyword : '热门影片';
    }

    if (container) {
        container.innerHTML = results.length
            ? results.slice(0, 240).map(card).join('')
            : '<div class="content-card"><h2>未找到匹配影片</h2><p>可以尝试更换片名、地区、年份、类型或标签继续搜索。</p></div>';
    }
})();
