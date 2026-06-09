(function () {
  'use strict';

  function getRoot() {
    return document.body.getAttribute('data-root') || '';
  }

  function resolveUrl(url) {
    if (!url) {
      return '#';
    }
    if (/^(https?:)?\/\//.test(url) || url.startsWith('#')) {
      return url;
    }
    return getRoot() + url;
  }

  function imagePath(cover) {
    return getRoot() + String(cover || 1) + '.jpg';
  }

  function handleImageFallbacks() {
    document.querySelectorAll('img[data-fallback-ready]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
        if (img.parentElement) {
          img.parentElement.classList.add('image-fallback');
        }
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function createInstantItem(item) {
    var anchor = document.createElement('a');
    anchor.className = 'instant-result-item';
    anchor.href = resolveUrl(item.url);
    anchor.innerHTML = '' +
      '<span class="instant-result-thumb image-shell">' +
        '<img src="' + imagePath(item.cover) + '" alt="' + escapeHtml(item.title) + '" data-fallback-ready="1">' +
        '<span class="poster-fallback-text">' + escapeHtml(item.type || '影片') + '</span>' +
      '</span>' +
      '<span>' +
        '<span class="instant-result-title">' + escapeHtml(item.title) + '</span>' +
        '<span class="instant-result-meta">' + escapeHtml(item.year || '') + ' · ' + escapeHtml(item.type || '') + ' · ' + escapeHtml(item.category || '') + '</span>' +
      '</span>';
    return anchor;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initInstantSearch() {
    var data = window.MOVIE_SEARCH_DATA || [];
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      var box = form.querySelector('[data-search-results]');
      if (!input || !box) {
        return;
      }

      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        box.innerHTML = '';
        if (!q) {
          box.classList.remove('open');
          return;
        }
        var results = data.filter(function (item) {
          return item.search.indexOf(q) !== -1;
        }).slice(0, 8);

        if (!results.length) {
          box.innerHTML = '<div class="instant-result-meta">未找到匹配影片</div>';
        } else {
          results.forEach(function (item) {
            box.appendChild(createInstantItem(item));
          });
          handleImageFallbacks();
        }
        box.classList.add('open');
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var q = input.value.trim();
        window.location.href = resolveUrl('search.html') + (q ? '?q=' + encodeURIComponent(q) : '');
      });

      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          box.classList.remove('open');
        }
      });
    });
  }

  function initPageSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var data = window.MOVIE_SEARCH_DATA || [];
    var input = page.querySelector('[data-page-search-input]');
    var results = page.querySelector('[data-page-search-results]');
    var empty = page.querySelector('[data-page-search-empty]');
    var params = new URLSearchParams(window.location.search);

    function render() {
      var q = input.value.trim().toLowerCase();
      var items = data.filter(function (item) {
        return !q || item.search.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = '';
      items.forEach(function (item) {
        var card = document.createElement('article');
        card.className = 'movie-card';
        card.innerHTML = '' +
          '<a class="poster-link image-shell" href="' + resolveUrl(item.url) + '">' +
            '<img src="' + imagePath(item.cover) + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy" data-fallback-ready="1">' +
            '<span class="poster-fallback-text">' + escapeHtml(item.type || '影片') + '</span>' +
            '<span class="card-badge">' + escapeHtml(item.year || '') + '</span>' +
            '<span class="card-meta-badge">' + escapeHtml(item.category || '') + '</span>' +
          '</a>' +
          '<div class="card-body">' +
            '<h2 class="card-title"><a href="' + resolveUrl(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
            '<div class="card-meta"><span>' + escapeHtml(item.region || '') + '</span><span>' + escapeHtml(item.type || '') + '</span></div>' +
            '<p class="card-desc">' + escapeHtml(item.one_line || '') + '</p>' +
          '</div>';
        results.appendChild(card);
      });
      empty.classList.toggle('open', items.length === 0);
      handleImageFallbacks();
    }

    input.value = params.get('q') || '';
    input.addEventListener('input', render);
    render();
  }

  function initFilterPanels() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute('data-filter-scope')) || document;
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-filter-empty]');

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.classList.toggle('hidden-by-filter', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('open', visible === 0);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-player-overlay]');
      var hlsSource = player.getAttribute('data-hls');
      var mp4Source = player.getAttribute('data-mp4');
      var attached = false;

      function attachSource() {
        if (attached || !video) {
          return;
        }
        attached = true;

        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
          return;
        }

        if (hlsSource && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
          return;
        }

        if (mp4Source) {
          video.src = mp4Source;
        }
      }

      function play() {
        attachSource();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    handleImageFallbacks();
    initMobileMenu();
    initHeroSlider();
    initInstantSearch();
    initPageSearch();
    initFilterPanels();
    initPlayers();
  });
})();
