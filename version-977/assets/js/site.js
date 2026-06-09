(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileNav() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.getElementById('mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll('.local-filter'));
    filters.forEach(function (input) {
      var targetId = input.getAttribute('data-filter-target');
      var grid = document.getElementById(targetId);
      if (!grid) {
        return;
      }
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          card.classList.toggle('is-hidden-by-filter', value && text.indexOf(value) === -1);
        });
      });
    });

    var sorts = Array.prototype.slice.call(document.querySelectorAll('.sort-control'));
    sorts.forEach(function (select) {
      var targetId = select.getAttribute('data-sort-target');
      var grid = document.getElementById(targetId);
      if (!grid) {
        return;
      }
      select.addEventListener('change', function () {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var mode = select.value;
        cards.sort(function (a, b) {
          if (mode === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
          }
          if (mode === 'year-desc' || mode === 'year-asc') {
            var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
            var by = parseInt(b.getAttribute('data-year'), 10) || 0;
            return mode === 'year-desc' ? by - ay : ay - by;
          }
          return 0;
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var source = player.getAttribute('data-source');
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var hlsInstance = null;
      if (!source || !video || !overlay) {
        return;
      }

      function attachSource() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.setAttribute('data-ready', 'true');
          return;
        }
        video.src = source;
        video.setAttribute('data-ready', 'true');
      }

      function playVideo() {
        attachSource();
        overlay.hidden = true;
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            overlay.hidden = false;
            player.classList.remove('is-playing');
          });
        }
      }

      overlay.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        overlay.hidden = true;
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        overlay.hidden = false;
        player.classList.remove('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function renderSearch() {
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    var input = document.getElementById('search-page-input');
    if (!results || !summary || !window.SEARCH_INDEX) {
      return;
    }
    var query = getQueryValue('q').trim();
    if (input) {
      input.value = query;
    }
    var list = window.SEARCH_INDEX;
    if (query) {
      var q = query.toLowerCase();
      list = list.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      });
      summary.textContent = '共找到 ' + list.length + ' 条与“' + query + '”相关的影片。';
    } else {
      list = list.slice(0, 60);
      summary.textContent = '展示最新 60 部影片，可输入关键词继续筛选。';
    }
    results.innerHTML = list.slice(0, 120).map(function (item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + item.url + '" aria-label="' + item.title + ' 在线观看">',
        '<img src="./' + item.cover + '" alt="' + item.title + '海报" loading="lazy">',
        '<span class="card-play"><span class="play-triangle" aria-hidden="true"></span></span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.type + '</span></div>',
        '<h3><a href="./' + item.url + '">' + item.title + '</a></h3>',
        '<p>' + item.oneLine + '</p>',
        '<div class="tag-row"><span>' + item.category + '</span><span>' + item.genre + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupPlayers();
    renderSearch();
  });
}());
