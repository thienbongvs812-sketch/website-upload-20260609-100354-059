(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-button");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero");
    if (hero) {
      var frames = Array.prototype.slice.call(hero.querySelectorAll(".hero-frame"));
      var features = Array.prototype.slice.call(hero.querySelectorAll(".hero-feature"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      function show(index) {
        current = index % features.length;
        frames.forEach(function (item, i) {
          item.classList.toggle("is-active", i === current);
        });
        features.forEach(function (item, i) {
          item.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (item, i) {
          item.classList.toggle("is-active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (features.length > 1) {
        show(0);
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
      var search = root.querySelector(".js-search");
      var type = root.querySelector(".js-type-filter");
      var year = root.querySelector(".js-year-filter");
      var noMatch = root.querySelector(".no-match");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      function apply() {
        var term = search ? search.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var ok = true;
          if (term && text.indexOf(term) === -1) {
            ok = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (noMatch) {
          noMatch.hidden = shown !== 0;
        }
      }
      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });
})();
