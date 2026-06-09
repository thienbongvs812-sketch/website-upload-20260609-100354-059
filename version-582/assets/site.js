(function() {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function matchYear(cardYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }
    if (selectedYear === '1990') {
      var numericYear = parseInt(cardYear, 10);
      return numericYear >= 1990 && numericYear < 2000;
    }
    return cardYear === selectedYear;
  }

  function filterCards(form) {
    var root = document;
    var input = form.querySelector('[data-search-input]');
    var yearSelect = form.querySelector('[data-year-filter]');
    var categorySelect = form.querySelector('[data-category-filter]');
    var query = normalize(input && input.value);
    var selectedYear = yearSelect ? yearSelect.value : '';
    var selectedCategory = categorySelect ? normalize(categorySelect.value) : '';
    var cards = root.querySelectorAll('[data-movie-card]');

    cards.forEach(function(card) {
      var title = normalize(card.getAttribute('data-title'));
      var year = String(card.getAttribute('data-year') || '');
      var tags = normalize(card.getAttribute('data-tags'));
      var region = normalize(card.getAttribute('data-region'));
      var type = normalize(card.getAttribute('data-type'));
      var haystack = [title, year, tags, region, type].join(' ');
      var byQuery = !query || haystack.indexOf(query) !== -1;
      var byYear = matchYear(year, selectedYear);
      var byCategory = !selectedCategory || tags.indexOf(selectedCategory) !== -1;
      card.classList.toggle('is-filtered', !(byQuery && byYear && byCategory));
    });
  }

  function setupFilters() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function(form) {
      var input = form.querySelector('[data-search-input]');
      var params = new URLSearchParams(window.location.search);
      var incomingQuery = params.get('q');
      if (incomingQuery && input) {
        input.value = incomingQuery;
      }
      form.addEventListener('submit', function(event) {
        if (document.querySelector('[data-movie-card]')) {
          event.preventDefault();
          filterCards(form);
        }
      });
      form.addEventListener('input', function() {
        filterCards(form);
      });
      form.addEventListener('change', function() {
        filterCards(form);
      });
      filterCards(form);
    });
  }

  function setupHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    function update() {
      header.classList.toggle('has-scroll', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  setupMenu();
  setupFilters();
  setupHeaderShadow();
})();
