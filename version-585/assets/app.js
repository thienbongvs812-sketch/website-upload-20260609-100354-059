(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!button || !links) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        restart();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var input = panel.querySelector('[data-movie-search]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var regionInput = panel.querySelector('[data-filter-region]');
            var empty = scope.parentElement ? scope.parentElement.querySelector('.empty-state') : null;

            function matchesYear(cardYear, value) {
                if (!value) {
                    return true;
                }
                var year = Number(cardYear || 0);
                if (value === 'before-2020') {
                    return year < 2020;
                }
                return String(year) === value;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var typeValue = typeSelect ? typeSelect.value : '';
                var yearValue = yearSelect ? yearSelect.value : '';
                var regionValue = regionInput ? regionInput.value.trim().toLowerCase() : '';
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (!matchesYear(card.getAttribute('data-year'), yearValue)) {
                        ok = false;
                    }
                    if (regionValue && (card.getAttribute('data-region') || '').toLowerCase().indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            [input, typeSelect, yearSelect, regionInput].forEach(function (item) {
                if (!item) {
                    return;
                }
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

(function (global) {
    function start(streamUrl) {
        var video = document.querySelector('[data-video-player]');
        var button = document.querySelector('[data-play-button]');
        if (!video || !button || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (global.Hls && global.Hls.isSupported()) {
                hlsInstance = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    global.SitePlayer = {
        start: start
    };
})(window);
