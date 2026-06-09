(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        var opened = mobile.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 6500);
      }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var root = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
      var search = panel.querySelector('[data-filter-search]');
      var region = panel.querySelector('[data-filter-region]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
      };
      var run = function () {
        var q = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(' '));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            ok = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            ok = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
        });
      };
      [search, region, year, type].forEach(function (field) {
        if (field) {
          field.addEventListener('input', run);
          field.addEventListener('change', run);
        }
      });
      run();
    });

    document.querySelectorAll('.js-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hls = null;
      var start = function () {
        if (!video || !stream) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          loaded = true;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            start();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
