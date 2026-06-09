(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function matchesQuery(card, query) {
    if (!query) {
      return true;
    }
    return normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
  }

  function updateCount(scope, count) {
    var target = scope.querySelector("[data-result-count]");
    if (target) {
      target.textContent = String(count);
    }
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
    var empty = page.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));

    if (input && query) {
      input.value = params.get("q");
    }

    function apply() {
      var value = normalize(input ? input.value : query);
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchesQuery(card, value);
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) {
          visible += 1;
        }
      });
      updateCount(page, visible);
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  function setupListPage() {
    var page = document.querySelector("[data-list-page]");
    if (!page) {
      return;
    }
    var input = page.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
    var genreButtons = Array.prototype.slice.call(page.querySelectorAll("[data-filter-value]"));
    var yearButtons = Array.prototype.slice.call(page.querySelectorAll("[data-year-value]"));
    var activeGenre = "all";
    var activeYear = "all";

    function setActive(buttons, button) {
      buttons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var cardGenre = card.getAttribute("data-genre") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var ok = matchesQuery(card, query);
        ok = ok && (activeGenre === "all" || cardGenre === activeGenre);
        ok = ok && (activeYear === "all" || cardYear === activeYear);
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) {
          visible += 1;
        }
      });
      updateCount(page, visible);
    }

    genreButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeGenre = button.getAttribute("data-filter-value") || "all";
        setActive(genreButtons, button);
        apply();
      });
    });

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = button.getAttribute("data-year-value") || "all";
        setActive(yearButtons, button);
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  window.initializeMoviePlayer = function (sourceUrl) {
    onReady(function () {
      var video = document.querySelector(".movie-video");
      var overlay = document.querySelector(".play-overlay");
      var hls = null;
      var attached = false;

      if (!video || !overlay || !sourceUrl) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function play() {
        attach();
        overlay.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupSearchPage();
    setupListPage();
  });
})();
