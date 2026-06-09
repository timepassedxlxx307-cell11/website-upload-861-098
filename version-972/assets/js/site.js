(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filters = document.querySelectorAll('[data-filter-input], [data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var keywordInput = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var keyword = normalize(keywordInput && keywordInput.value);
    var type = normalize(typeSelect && typeSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var visible = true;

      if (keyword && text.indexOf(keyword) === -1) {
        visible = false;
      }
      if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
        visible = false;
      }
      if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
        visible = false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        visible = false;
      }

      card.style.display = visible ? '' : 'none';
    });
  }

  filters.forEach(function (item) {
    item.addEventListener('input', applyFilters);
    item.addEventListener('change', applyFilters);
  });

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && window.movieSearchData) {
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var searchButton = searchRoot.querySelector('[data-search-button]');
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var emptyState = searchRoot.querySelector('[data-empty-state]');

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderSearch() {
      var keyword = normalize(searchInput && searchInput.value);
      var source = window.movieSearchData;
      var result = source.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.year,
          movie.tags
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 96);

      resultGrid.innerHTML = result.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
          '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="movie-badge">' + escapeHtml(movie.year) + '</span>',
          '    <span class="play-chip">立即观看</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
          '    <p class="movie-meta">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
          '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (emptyState) {
        emptyState.style.display = result.length ? 'none' : 'block';
      }
    }

    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          renderSearch();
        }
      });
    }

    renderSearch();
  }

  var player = document.querySelector('[data-role="movie-player"]');
  var playButton = document.querySelector('[data-role="play-button"]');

  if (player && playButton) {
    var loaded = false;
    var hls = null;

    function bindVideo() {
      if (loaded) {
        return;
      }

      loaded = true;
      var url = player.getAttribute('data-video');

      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(player);
      } else {
        player.src = url;
      }
    }

    function startVideo() {
      bindVideo();
      player.controls = true;
      playButton.classList.add('is-hidden');
      var playPromise = player.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          playButton.classList.remove('is-hidden');
        });
      }
    }

    playButton.addEventListener('click', startVideo);
    player.addEventListener('click', function () {
      if (!loaded || player.paused) {
        startVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();
